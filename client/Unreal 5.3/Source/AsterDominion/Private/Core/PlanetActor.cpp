#include "Core/PlanetActor.h"

#include "Components/StaticMeshComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
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

    static ConstructorHelpers::FObjectFinder<UMaterialInterface> ShapeMat(
        TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
    if (ShapeMat.Succeeded())
    {
        PlanetMesh->SetMaterial(0, ShapeMat.Object);
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
            // BasicShapeMaterial exposes a "Color" parameter.
            DynMat->SetVectorParameterValue(TEXT("Color"), FLinearColor(0.1f, 0.4f, 0.9f, 1.0f));
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
