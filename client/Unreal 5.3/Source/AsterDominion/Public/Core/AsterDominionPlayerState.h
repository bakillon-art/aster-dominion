#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerState.h"
#include "Systems/PlanetHudData.h"
#include "AsterDominionPlayerState.generated.h"

UCLASS()
class ASTERDOMINION_API AAsterDominionPlayerState : public APlayerState
{
    GENERATED_BODY()

public:
    AAsterDominionPlayerState();

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void SetDashboard(const FPlanetHudData& NewDashboard);

    UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "AsterDominion")
    FPlanetHudData Dashboard;
};
