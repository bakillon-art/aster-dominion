#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "StarFieldActor.generated.h"

UCLASS()
class ASTERDOMINION_API AStarFieldActor : public AActor
{
    GENERATED_BODY()

public:
    AStarFieldActor();

    virtual void BeginPlay() override;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stars")
    int32 StarCount = 150;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stars")
    float FieldRadius = 9000.0f;

private:
    TObjectPtr<UStaticMesh> CachedSphereMesh;
    TObjectPtr<UMaterialInterface> CachedMaterial;
};
