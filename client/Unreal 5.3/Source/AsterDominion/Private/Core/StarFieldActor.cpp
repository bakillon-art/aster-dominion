#include "Core/StarFieldActor.h"

#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"

AStarFieldActor::AStarFieldActor()
{
    PrimaryActorTick.bCanEverTick = false;

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

void AStarFieldActor::BeginPlay()
{
    Super::BeginPlay();

    if (!CachedSphereMesh)
    {
        return;
    }

    for (int32 i = 0; i < StarCount; ++i)
    {
        const FString Name = FString::Printf(TEXT("Star_%d"), i);
        UStaticMeshComponent* Star = NewObject<UStaticMeshComponent>(this, *Name);
        if (!Star)
        {
            continue;
        }

        Star->SetStaticMesh(CachedSphereMesh);
        if (CachedMaterial)
        {
            Star->SetMaterial(0, CachedMaterial);
        }
        Star->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Star->SetCastShadow(false);
        Star->SetSimulatePhysics(false);

        const FVector Dir = FMath::VRand();
        const float Dist = FieldRadius * FMath::FRandRange(0.7f, 1.0f);
        Star->SetWorldLocation(Dir * Dist);

        const float Scale = FMath::FRandRange(0.01f, 0.03f);
        Star->SetWorldScale3D(FVector(Scale));

        Star->RegisterComponent();

        UMaterialInstanceDynamic* StarMat = Star->CreateAndSetMaterialInstanceDynamic(0);
        if (StarMat)
        {
            const float Brightness = FMath::FRandRange(0.5f, 1.0f);
            StarMat->SetVectorParameterValue(TEXT("Color"), FLinearColor(Brightness, Brightness, Brightness * 1.1f, 1.0f));
        }
    }
}
