#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SolarSystemActor.generated.h"

class UStaticMeshComponent;
class UPointLightComponent;

UCLASS()
class ASTERDOMINION_API ASolarSystemActor : public AActor
{
    GENERATED_BODY()

public:
    ASolarSystemActor();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    // System coordinate this actor renders (from the backend galaxy).
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "SolarSystem")
    int32 SystemIndex = 1;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "SolarSystem")
    float OrbitSpeed = 6.0f;

private:
    void SpawnSun();
    void SpawnPlanets();
    void FetchSystemState();

    TObjectPtr<UStaticMeshComponent> SunMesh;
    TObjectPtr<UPointLightComponent> SunLight;

    struct FOrbitingPlanet
    {
        TObjectPtr<UStaticMeshComponent> Mesh;
        float OrbitRadius;
        float Angle;
        float Speed;
    };

    TArray<FOrbitingPlanet> Planets;
    float Elapsed = 0.0f;

    TObjectPtr<UStaticMesh> CachedSphereMesh;
    TObjectPtr<UMaterialInterface> CachedMaterial;
};
