#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "Systems/PlanetHudData.h"
#include "Systems/PlanetStatusWidget.h"
#include "AsterDominionHUD.generated.h"

struct FHudButton
{
    FString Label;
    FString Action;
    FString Param;
    FVector2D Position;
    FVector2D Size;
    FLinearColor Color;
};

UCLASS()
class ASTERDOMINION_API AAsterDominionHUD : public AHUD
{
    GENERATED_BODY()

public:
    AAsterDominionHUD();

    virtual void BeginPlay() override;
    virtual void DrawHUD() override;

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void ApplyDashboard(const FPlanetHudData& Data);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AsterDominion")
    TSubclassOf<UPlanetStatusWidget> StatusWidgetClass;

    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion")
    TObjectPtr<UPlanetStatusWidget> StatusWidget;

    UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "AsterDominion")
    FPlanetHudData CurrentDashboard;

    UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "AsterDominion")
    bool bHasDashboardData = false;

private:
    TArray<FHudButton> ActionButtons;
    bool bButtonsBuilt = false;
    FTimerHandle RefreshTimer;
    void BuildActionButtons();
    void DrawButton(const FHudButton& Button, const FVector2D& MousePos, bool bHovered);
    void HandleClick(const FVector2D& MousePos);
    void SendAction(const FString& Endpoint, const FString& JsonBody);
    void RefreshDashboard();
    void SyncProductionAndRefresh();
};
