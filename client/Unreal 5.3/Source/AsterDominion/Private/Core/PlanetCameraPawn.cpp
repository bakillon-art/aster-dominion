#include "Core/PlanetCameraPawn.h"

#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"

APlanetCameraPawn::APlanetCameraPawn()
{
    PrimaryActorTick.bCanEverTick = true;

    RootScene = CreateDefaultSubobject<USceneComponent>(TEXT("RootScene"));
    RootComponent = RootScene;

    SpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("SpringArm"));
    SpringArm->SetupAttachment(RootScene);
    SpringArm->TargetArmLength = DistanceFromPlanet;
    SpringArm->bUsePawnControlRotation = false;
    SpringArm->bDoCollisionTest = false;

    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(SpringArm, USpringArmComponent::SocketName);
    Camera->bUsePawnControlRotation = false;
}

void APlanetCameraPawn::BeginPlay()
{
    Super::BeginPlay();
    SpringArm->TargetArmLength = DistanceFromPlanet;
}

void APlanetCameraPawn::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);

    Yaw += OrbitSpeed * DeltaSeconds;

    // Orbit the arm around the planet at origin so the camera circles it.
    const FRotator ArmRotation(Pitch, Yaw, 0.0f);
    SpringArm->SetWorldRotation(ArmRotation);
    SpringArm->TargetArmLength = DistanceFromPlanet;
}

void APlanetCameraPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
}
