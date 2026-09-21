#include "Systems/PlanetStatusWidget.h"

#include "Core/AsterDominionGameInstance.h"

void UPlanetStatusWidget::NativeConstruct()
{
    Super::NativeConstruct();
    SetData(CurrentData);
}

void UPlanetStatusWidget::SetData(const FPlanetHudData& NewData)
{
    CurrentData = NewData;

    if (PlanetNameText)
    {
        PlanetNameText->SetText(FText::FromString(NewData.PlanetName.IsEmpty() ? TEXT("Aster Prime") : NewData.PlanetName));
    }

    if (PlayerNameText)
    {
        PlayerNameText->SetText(FText::FromString(NewData.PlayerName.IsEmpty() ? TEXT("demo-player") : NewData.PlayerName));
    }

    if (MetalText)
    {
        MetalText->SetText(FText::AsNumber(NewData.Resources.Metal));
    }

    if (CrystalText)
    {
        CrystalText->SetText(FText::AsNumber(NewData.Resources.Crystal));
    }

    if (DeuteriumText)
    {
        DeuteriumText->SetText(FText::AsNumber(NewData.Resources.Deuterium));
    }

    if (EnergyText)
    {
        EnergyText->SetText(FText::AsNumber(NewData.Resources.Energy));
    }

    if (ProductionText)
    {
        const FString ProductionSummary = FString::Printf(TEXT("M %d / C %d / D %d / E %d"),
            NewData.Production.Metal,
            NewData.Production.Crystal,
            NewData.Production.Deuterium,
            NewData.Production.Energy);
        ProductionText->SetText(FText::FromString(ProductionSummary));
    }

    if (FleetText)
    {
        FleetText->SetText(FText::AsNumber(NewData.TotalShips));
    }

    if (PhaseText)
    {
        PhaseText->SetText(FText::FromString(NewData.Phase));
    }
}

void UPlanetStatusWidget::RefreshFromBackend()
{
    if (UWorld* World = GetWorld())
    {
        if (UASTERDOMINIONGAMEINSTANCE* GameInstance = Cast<UASTERDOMINIONGAMEINSTANCE>(World->GetGameInstance()))
        {
            GameInstance->LoadPlayerDashboard(TEXT("player-demo"));
        }
    }
}
