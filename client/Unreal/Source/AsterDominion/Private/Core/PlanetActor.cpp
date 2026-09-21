#include "Core/PlanetActor.h"

#include "Components/SphereComponent.h"
#include "Components/StaticMeshComponent.h"
#include "GameFramework/Actor.h"

APlanetActor::APlanetActor()
{
    PrimaryActorTick.bCanEverTick = true;

    RootScene = CreateDefaultSubobject<USceneComponent>(TEXT("RootScene"));
    RootComponent = RootScene;

    PlanetMesh = CreateDefaultSubobject<USphereComponent>(TEXT("PlanetMesh"));
    PlanetMesh->SetupAttachment(RootScene);
    PlanetMesh->SetSphereRadius(180.0f);
    PlanetMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    PlanetMesh->SetSimulatePhysics(false);
}

void APlanetActor::BeginPlay()
{
    Super::BeginPlay();
    SetActorScale3D(PlanetScale);
}

void APlanetActor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    FRotator NewRotation = GetActorRotation();
    NewRotation.Yaw += RotationSpeed * DeltaTime * 10.0f;
    SetActorRotation(NewRotation);
}
