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
    float OrbitSpeed = 40.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float DistanceFromPlanet = 1800.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float Pitch = 25.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Camera")
    float Yaw = 0.0f;

protected:
    virtual void BeginPlay() override;
};
