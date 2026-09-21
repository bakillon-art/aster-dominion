#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/TextBlock.h"
#include "Systems/PlanetHudData.h"
#include "PlanetStatusWidget.generated.h"

UCLASS()
class ASTERDOMINION_API UPlanetStatusWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "AsterDominion")
    FPlanetHudData CurrentData;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> PlanetNameText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> PlayerNameText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> MetalText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> CrystalText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> DeuteriumText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> EnergyText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> ProductionText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> FleetText;

    UPROPERTY(meta = (BindWidget))
    TObjectPtr<UTextBlock> PhaseText;

    virtual void NativeConstruct() override;

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void SetData(const FPlanetHudData& NewData);

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void RefreshFromBackend();
};
