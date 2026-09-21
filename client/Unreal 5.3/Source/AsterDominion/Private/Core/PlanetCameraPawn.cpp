#include "Core/PlanetCameraPawn.h"

#include "Camera/CameraComponent.h"
#include "GameFramework/PlayerController.h"
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

    APlayerController* PC = Cast<APlayerController>(GetController());
    if (PC)
    {
        const bool bRightDown = PC->IsInputKeyDown(EKeys::RightMouseButton);
        const bool bLeftDown = PC->IsInputKeyDown(EKeys::LeftMouseButton);
        const bool bAnyDrag = bRightDown || bLeftDown;

        float MouseX = 0.0f;
        float MouseY = 0.0f;
        PC->GetMousePosition(MouseX, MouseY);
        const FVector2D CurrentMouse(MouseX, MouseY);

        if (bAnyDrag)
        {
            if (bDragging)
            {
                const FVector2D Delta = CurrentMouse - LastMousePos;
                Yaw -= Delta.X * MouseSensitivity;
                Pitch = FMath::Clamp(Pitch + Delta.Y * MouseSensitivity, -80.0f, 85.0f);
                bAutoOrbit = false;
            }
            bDragging = true;
            LastMousePos = CurrentMouse;
        }
        else
        {
            bDragging = false;
        }

        // Zoom with the mouse wheel.
        const float Wheel = PC->GetInputAnalogKeyState(EKeys::MouseWheelAxis);
        if (!FMath::IsNearlyZero(Wheel))
        {
            DistanceFromPlanet = FMath::Clamp(
                DistanceFromPlanet - Wheel * ZoomSpeed, MinDistance, MaxDistance);
        }
    }

    if (bAutoOrbit)
    {
        Yaw += OrbitSpeed * DeltaSeconds;
    }

    const FRotator ArmRotation(Pitch, Yaw, 0.0f);
    SpringArm->SetWorldRotation(ArmRotation);
    SpringArm->TargetArmLength = DistanceFromPlanet;
}

void APlanetCameraPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
}
