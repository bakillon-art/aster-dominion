#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "PlanetHudData.h"
#include "GameApiClient.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FDashboardFetched, const FPlanetHudData&, DashboardData);

UCLASS(BlueprintType)
class UGameApiClient : public UObject
{
    GENERATED_BODY()

public:
    UGameApiClient();

    UFUNCTION(BlueprintCallable, Category = "AsterDominion|API")
    void FetchDashboard(const FString& PlayerId);

    UFUNCTION(BlueprintCallable, Category = "AsterDominion|API")
    bool IsReady() const;

    UPROPERTY(BlueprintAssignable, Category = "AsterDominion|API")
    FDashboardFetched OnDashboardFetched;

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion|API")
    FPlanetHudData LastDashboard;

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion|API")
    bool bReady = false;

private:
    FString BackendBaseUrl = TEXT("http://localhost:3001");
    void ParseDashboardPayload(const FString& JsonString);
};
