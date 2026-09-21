#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "Systems/PlanetHudData.h"
#include "Systems/PlanetStatusWidget.h"
#include "AsterDominionHUD.generated.h"

UCLASS()
class ASTERDOMINION_API AAsterDominionHUD : public AHUD
{
    GENERATED_BODY()

public:
    AAsterDominionHUD();

    virtual void BeginPlay() override;

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void ApplyDashboard(const FPlanetHudData& Data);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AsterDominion")
    TSubclassOf<UPlanetStatusWidget> StatusWidgetClass;

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion")
    TObjectPtr<UPlanetStatusWidget> StatusWidget;

    UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "AsterDominion")
    FPlanetHudData CurrentDashboard;
};
