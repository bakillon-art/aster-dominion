#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "PlanetCameraPawn.generated.h"

UCLASS()
class ASTERDOMINION_API APlanetCameraPawn : public APawn
{
    GENERATED_BODY()

public:
    APlanetCameraPawn();

    virtual void Tick(float DeltaSeconds) override;
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    class USceneComponent* RootScene;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    class USpringArmComponent* SpringArm;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    class UCameraComponent* Camera;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float OrbitSpeed = 8.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float DistanceFromPlanet = 2600.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float Pitch = 55.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float Yaw = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float MouseSensitivity = 0.6f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float ZoomSpeed = 400.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float MinDistance = 800.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float MaxDistance = 8000.0f;

    // Auto-orbit only until the user grabs the camera.
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    bool bAutoOrbit = true;

protected:
    virtual void BeginPlay() override;

private:
    bool bDragging = false;
    FVector2D LastMousePos = FVector2D::ZeroVector;
};
