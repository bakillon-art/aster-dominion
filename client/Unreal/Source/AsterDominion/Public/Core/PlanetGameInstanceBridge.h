#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "Systems/PlanetHudData.h"
#include "PlanetGameInstanceBridge.generated.h"

UCLASS(BlueprintType)
class ASTERDOMINION_API UPlanetGameInstanceBridge : public UObject
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void ApplyDashboardData(const FPlanetHudData& Data);

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion")
    FPlanetHudData DashboardData;
};
