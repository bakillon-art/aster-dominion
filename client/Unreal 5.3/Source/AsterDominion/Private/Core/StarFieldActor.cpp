#include "Core/StarFieldActor.h"

#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "UObject/ConstructorHelpers.h"

AStarFieldActor::AStarFieldActor()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AStarFieldActor::BeginPlay()
{
    Super::BeginPlay();

    UStaticMesh* SphereMesh = nullptr;
    static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereFinder(
        TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (SphereFinder.Succeeded())
    {
        SphereMesh = SphereFinder.Object;
    }

    if (!SphereMesh)
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

        Star->SetStaticMesh(SphereMesh);
        Star->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Star->SetCastShadow(false);
        Star->SetSimulatePhysics(false);

        // Random point on a sphere shell around the origin.
        const FVector Dir = FMath::VRand();
        const float Dist = FieldRadius * FMath::FRandRange(0.6f, 1.0f);
        Star->SetWorldLocation(Dir * Dist);

        const float Scale = FMath::FRandRange(0.02f, 0.09f);
        Star->SetWorldScale3D(FVector(Scale));

        Star->RegisterComponent();

        UMaterialInstanceDynamic* StarMat = Star->CreateAndSetMaterialInstanceDynamic(0);
        if (StarMat)
        {
            const float Brightness = FMath::FRandRange(0.7f, 1.0f);
            StarMat->SetVectorParameterValue(TEXT("Color"), FLinearColor(Brightness, Brightness, Brightness, 1.0f));
        }
    }
}
