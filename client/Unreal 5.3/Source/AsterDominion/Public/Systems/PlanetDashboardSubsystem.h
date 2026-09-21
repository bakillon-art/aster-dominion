#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Systems/PlanetHudData.h"
#include "PlanetDashboardSubsystem.generated.h"

UCLASS()
class ASTERDOMINION_API UPlanetDashboardSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    UPlanetDashboardSubsystem();

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void LoadDashboard(const FString& PlayerId);

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion")
    FPlanetHudData DashboardData;

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion")
    bool bIsLoaded = false;

private:
    FString BackendUrl = TEXT("http://localhost:3001");
    void ParsePayload(const FString& JsonString);
};
