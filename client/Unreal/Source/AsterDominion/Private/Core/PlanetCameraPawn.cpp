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
    SpringArm->bUsePawnControlRotation = true;
    SpringArm->SetRelativeRotation(FRotator(Pitch, 0.0f, 0.0f));

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
    FRotator Rotation(0.0f, Yaw, 0.0f);
    SetActorRotation(Rotation);

    FVector Offset(0.0f, 0.0f, 0.0f);
    SpringArm->SetRelativeLocation(Offset);
    SpringArm->TargetArmLength = DistanceFromPlanet;
}

void APlanetCameraPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
}
