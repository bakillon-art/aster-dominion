#include "Core/PlanetActor.h"

#include "Components/StaticMeshComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"
#include "Engine/StaticMesh.h"
#include "GameFramework/Actor.h"

APlanetActor::APlanetActor()
{
    PrimaryActorTick.bCanEverTick = true;

    RootScene = CreateDefaultSubobject<USceneComponent>(TEXT("RootScene"));
    RootComponent = RootScene;

    PlanetMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PlanetMesh"));
    PlanetMesh->SetupAttachment(RootScene);

    static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereMesh(
        TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (SphereMesh.Succeeded())
    {
        PlanetMesh->SetStaticMesh(SphereMesh.Object);
    }

    PlanetMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    PlanetMesh->SetSimulatePhysics(false);
    PlanetMesh->SetWorldScale3D(FVector(2.0f, 2.0f, 2.0f));
}

void APlanetActor::BeginPlay()
{
    Super::BeginPlay();
    SetActorScale3D(PlanetScale);

    if (PlanetMesh)
    {
        UMaterialInstanceDynamic* DynMat = PlanetMesh->CreateAndSetMaterialInstanceDynamic(0);
        if (DynMat)
        {
            // Force a readable ocean-blue planet regardless of the base material's parameter names.
            const FLinearColor OceanBlue(0.12f, 0.35f, 0.75f, 1.0f);
            DynMat->SetVectorParameterValue(TEXT("BaseColor"), OceanBlue);
            DynMat->SetVectorParameterValue(TEXT("Color"), OceanBlue);
            DynMat->SetVectorParameterValue(TEXT("Base Color"), OceanBlue);
            DynMat->SetScalarParameterValue(TEXT("Roughness"), 0.5f);
            DynMat->SetScalarParameterValue(TEXT("Metallic"), 0.0f);
            DynMat->SetScalarParameterValue(TEXT("Specular"), 0.3f);
        }
    }
}

void APlanetActor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    FRotator NewRotation = GetActorRotation();
    NewRotation.Yaw += RotationSpeed * DeltaTime * 10.0f;
    SetActorRotation(NewRotation);
}
