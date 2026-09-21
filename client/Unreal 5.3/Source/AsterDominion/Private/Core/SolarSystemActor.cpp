#include "Core/SolarSystemActor.h"

#include "Components/PointLightComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "Json.h"
#include "JsonUtilities.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"

ASolarSystemActor::ASolarSystemActor()
{
    PrimaryActorTick.bCanEverTick = true;

    static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereFinder(
        TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (SphereFinder.Succeeded())
    {
        CachedSphereMesh = SphereFinder.Object;
    }

    static ConstructorHelpers::FObjectFinder<UMaterialInterface> MatFinder(
        TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
    if (MatFinder.Succeeded())
    {
        CachedMaterial = MatFinder.Object;
    }
}

void ASolarSystemActor::BeginPlay()
{
    Super::BeginPlay();
    SpawnSun();
    SpawnPlanets();
    FetchSystemState();
}

void ASolarSystemActor::SpawnSun()
{
    SunMesh = NewObject<UStaticMeshComponent>(this, TEXT("SunMesh"));
    SunMesh->RegisterComponent();
    SunMesh->AttachToComponent(RootComponent ? RootComponent : GetRootComponent(), FAttachmentTransformRules::KeepWorldTransform);
    if (CachedSphereMesh)
    {
        SunMesh->SetStaticMesh(CachedSphereMesh);
    }
    if (CachedMaterial)
    {
        SunMesh->SetMaterial(0, CachedMaterial);
        if (UMaterialInstanceDynamic* SunMat = SunMesh->CreateAndSetMaterialInstanceDynamic(0))
        {
            SunMat->SetVectorParameterValue(TEXT("Color"), FLinearColor(1.0f, 0.85f, 0.4f, 1.0f));
        }
    }
    SunMesh->SetWorldScale3D(FVector(1.5f));
    SunMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    SunMesh->SetCastShadow(false);

    SunLight = NewObject<UPointLightComponent>(this, TEXT("SunLight"));
    SunLight->RegisterComponent();
    SunLight->AttachToComponent(SunMesh, FAttachmentTransformRules::KeepRelativeTransform);
    SunLight->SetIntensity(50000.0f);
    SunLight->SetLightColor(FColor(255, 240, 210));
    SunLight->SetAttenuationRadius(20000.0f);
}

void ASolarSystemActor::SpawnPlanets()
{
    if (!CachedSphereMesh)
    {
        return;
    }

    // 6 orbital slots matching the backend's POSITIONS_PER_SYSTEM.
    const float BaseRadius = 400.0f;
    const float RadiusStep = 220.0f;

    for (int32 i = 0; i < 6; ++i)
    {
        const FString Name = FString::Printf(TEXT("OrbitPlanet_%d"), i);
        UStaticMeshComponent* PlanetMesh = NewObject<UStaticMeshComponent>(this, *Name);
        if (!PlanetMesh)
        {
            continue;
        }

        PlanetMesh->RegisterComponent();
        PlanetMesh->AttachToComponent(RootComponent ? RootComponent : GetRootComponent(), FAttachmentTransformRules::KeepWorldTransform);
        PlanetMesh->SetStaticMesh(CachedSphereMesh);
        if (CachedMaterial)
        {
            PlanetMesh->SetMaterial(0, CachedMaterial);
            if (UMaterialInstanceDynamic* PlanetMat = PlanetMesh->CreateAndSetMaterialInstanceDynamic(0))
            {
                // Default: empty/rocky grey until the backend says otherwise.
                PlanetMat->SetVectorParameterValue(TEXT("Color"), FLinearColor(0.35f, 0.33f, 0.3f, 1.0f));
            }
        }

        const float Scale = 0.35f + i * 0.06f;
        PlanetMesh->SetWorldScale3D(FVector(Scale));
        PlanetMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        PlanetMesh->SetCastShadow(true);

        FOrbitingPlanet Planet;
        Planet.Mesh = PlanetMesh;
        Planet.OrbitRadius = BaseRadius + i * RadiusStep;
        Planet.Angle = i * 60.0f;
        Planet.Speed = OrbitSpeed / (1.0f + i * 0.4f);
        Planets.Add(Planet);
    }
}

void ASolarSystemActor::FetchSystemState()
{
    const FString Url = FString::Printf(
        TEXT("http://localhost:3001/galaxy/1/%d"), SystemIndex);

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetVerb(TEXT("GET"));
    Request->SetURL(Url);
    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr, FHttpResponsePtr Response, bool bWasSuccessful)
        {
            if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
            {
                return;
            }

            TSharedPtr<FJsonObject> JsonObject;
            TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Response->GetContentAsString());
            if (!FJsonSerializer::Deserialize(Reader, JsonObject) || !JsonObject.IsValid())
            {
                return;
            }

            const TArray<TSharedPtr<FJsonValue>>* Slots = nullptr;
            if (!JsonObject->TryGetArrayField(TEXT("slots"), Slots) || !Slots)
            {
                return;
            }

            for (int32 i = 0; i < Slots->Num() && i < Planets.Num(); ++i)
            {
                const TSharedPtr<FJsonObject> SlotObj = (*Slots)[i]->AsObject();
                if (!SlotObj.IsValid())
                {
                    continue;
                }

                const bool bIsEmpty = SlotObj->GetBoolField(TEXT("isEmpty"));
                if (bIsEmpty)
                {
                    continue;
                }

                const TSharedPtr<FJsonObject>* PlanetObj = nullptr;
                if (SlotObj->TryGetObjectField(TEXT("planet"), PlanetObj) && PlanetObj && PlanetObj->IsValid())
                {
                    // Occupied: tint the planet blue-green.
                    if (UMaterialInstanceDynamic* Mat = Planets[i].Mesh->CreateAndSetMaterialInstanceDynamic(0))
                    {
                        Mat->SetVectorParameterValue(TEXT("Color"), FLinearColor(0.2f, 0.5f, 0.8f, 1.0f));
                    }
                }
            }
        });
    Request->ProcessRequest();
}

void ASolarSystemActor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    Elapsed += DeltaTime;

    for (FOrbitingPlanet& Planet : Planets)
    {
        if (!Planet.Mesh)
        {
            continue;
        }

        Planet.Angle += Planet.Speed * DeltaTime;
        const float Radians = FMath::DegreesToRadians(Planet.Angle);
        const FVector Position(
            FMath::Cos(Radians) * Planet.OrbitRadius,
            FMath::Sin(Radians) * Planet.OrbitRadius,
            0.0f);
        Planet.Mesh->SetWorldLocation(Position);
    }

    if (SunMesh)
    {
        FRotator SunRotation = SunMesh->GetComponentRotation();
        SunRotation.Yaw += 4.0f * DeltaTime;
        SunMesh->SetWorldRotation(SunRotation);
    }
}
