#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "PlanetActor.generated.h"

UCLASS()
class ASTERDOMINION_API APlanetActor : public AActor
{
    GENERATED_BODY()

public:
    APlanetActor();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Planet")
    class USceneComponent* RootScene;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Planet")
    class USphereComponent* PlanetMesh;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Planet")
    float RotationSpeed = 12.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Planet")
    FVector PlanetScale = FVector(1.0f, 1.0f, 1.0f);
};
