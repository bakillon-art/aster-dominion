#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/TextBlock.h"
#include "Systems/PlanetHudData.h"
#include "PlanetStatusWidget.generated.h"

class UVerticalBox;
class UBorder;
class UHorizontalBox;
class UImage;

UCLASS()
class ASTERDOMINION_API UPlanetStatusWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    UPROPERTY(BlueprintReadWrite, EditAnywhere, Category = "AsterDominion")
    FPlanetHudData CurrentData;

    virtual void NativeConstruct() override;

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void SetData(const FPlanetHudData& NewData);

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void RefreshFromBackend();

private:
    void BuildLayout();
    UTextBlock* CreateLabel(UVerticalBox* Parent, const FString& Text, const FLinearColor& Color, int32 FontSize = 14, bool bBold = false);
    void CreateResourceRow(UVerticalBox* Parent, const FString& Label, const FLinearColor& IconColor, TObjectPtr<UTextBlock>& OutValueText);

    UPROPERTY()
    TObjectPtr<UTextBlock> TitleText;

    UPROPERTY()
    TObjectPtr<UTextBlock> PlanetNameText;

    UPROPERTY()
    TObjectPtr<UTextBlock> PlayerNameText;

    UPROPERTY()
    TObjectPtr<UTextBlock> MetalText;

    UPROPERTY()
    TObjectPtr<UTextBlock> CrystalText;

    UPROPERTY()
    TObjectPtr<UTextBlock> DeuteriumText;

    UPROPERTY()
    TObjectPtr<UTextBlock> EnergyText;

    UPROPERTY()
    TObjectPtr<UTextBlock> ProductionText;

    UPROPERTY()
    TObjectPtr<UTextBlock> FleetText;

    UPROPERTY()
    TObjectPtr<UTextBlock> PhaseText;
};
