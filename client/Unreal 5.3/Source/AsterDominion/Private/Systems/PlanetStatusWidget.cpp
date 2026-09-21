#include "Systems/PlanetStatusWidget.h"

#include "Blueprint/WidgetTree.h"
#include "Core/AsterDominionGameInstance.h"
#include "Components/Border.h"
#include "Components/CanvasPanel.h"
#include "Components/CanvasPanelSlot.h"
#include "Components/HorizontalBox.h"
#include "Components/HorizontalBoxSlot.h"
#include "Components/Image.h"
#include "Components/SizeBox.h"
#include "Components/VerticalBox.h"
#include "Components/VerticalBoxSlot.h"
#include "Styling/CoreStyle.h"

void UPlanetStatusWidget::NativeConstruct()
{
    Super::NativeConstruct();
    UE_LOG(LogTemp, Log, TEXT("PlanetStatusWidget NativeConstruct, RootWidget=%s"), WidgetTree->RootWidget ? TEXT("yes") : TEXT("no"));

    if (!WidgetTree->RootWidget)
    {
        BuildLayout();
        UE_LOG(LogTemp, Log, TEXT("PlanetStatusWidget BuildLayout done, RootWidget=%s"), WidgetTree->RootWidget ? TEXT("yes") : TEXT("no"));
    }

    SetData(CurrentData);
}

void UPlanetStatusWidget::BuildLayout()
{
    // Root border: dark semi-transparent panel with padding.
    UBorder* Panel = WidgetTree->ConstructWidget<UBorder>(UBorder::StaticClass(), TEXT("Panel"));
    Panel->SetBrushColor(FLinearColor(0.02f, 0.03f, 0.06f, 0.85f));
    Panel->SetPadding(FMargin(14.0f));

    UVerticalBox* Box = WidgetTree->ConstructWidget<UVerticalBox>(UVerticalBox::StaticClass(), TEXT("ContentBox"));
    Panel->SetContent(Box);

    TitleText = CreateLabel(Box, TEXT("ASTER DOMINION"), FLinearColor(0.3f, 0.85f, 1.0f), 20, true);
    PlanetNameText = CreateLabel(Box, TEXT("-"), FLinearColor(0.6f, 0.9f, 1.0f), 16, true);
    PlayerNameText = CreateLabel(Box, TEXT("-"), FLinearColor(0.8f, 0.8f, 0.8f), 12);

    CreateResourceRow(Box, TEXT("Metal"), FLinearColor(0.75f, 0.75f, 0.78f), MetalText);
    CreateResourceRow(Box, TEXT("Cristal"), FLinearColor(0.4f, 0.8f, 1.0f), CrystalText);
    CreateResourceRow(Box, TEXT("Deuterio"), FLinearColor(0.4f, 1.0f, 0.6f), DeuteriumText);
    CreateResourceRow(Box, TEXT("Energia"), FLinearColor(1.0f, 0.85f, 0.3f), EnergyText);

    ProductionText = CreateLabel(Box, TEXT("-"), FLinearColor(0.7f, 0.7f, 0.75f), 12);
    FleetText = CreateLabel(Box, TEXT("-"), FLinearColor(0.9f, 0.7f, 0.4f), 13);
    PhaseText = CreateLabel(Box, TEXT("-"), FLinearColor(0.5f, 0.6f, 0.7f), 11);

    // Root canvas with a fixed-size slot so the panel always has geometry.
    UCanvasPanel* RootCanvas = WidgetTree->ConstructWidget<UCanvasPanel>(UCanvasPanel::StaticClass(), TEXT("RootCanvas"));
    WidgetTree->RootWidget = RootCanvas;

    UCanvasPanelSlot* PanelSlot = RootCanvas->AddChildToCanvas(Panel);
    PanelSlot->SetAutoSize(false);
    PanelSlot->SetSize(FVector2D(360.0f, 300.0f));
    PanelSlot->SetPosition(FVector2D(0.0f, 0.0f));
}

UTextBlock* UPlanetStatusWidget::CreateLabel(UVerticalBox* Parent, const FString& Text, const FLinearColor& Color, int32 FontSize, bool bBold)
{
    UTextBlock* Label = WidgetTree->ConstructWidget<UTextBlock>(UTextBlock::StaticClass());
    Label->SetText(FText::FromString(Text));
    Label->SetColorAndOpacity(FSlateColor(Color));

    FSlateFontInfo FontInfo = FCoreStyle::GetDefaultFontStyle(bBold ? "Bold" : "Regular", FontSize);
    Label->SetFont(FontInfo);
    Label->SetShadowOffset(FVector2D(1.0f, 1.0f));
    Label->SetShadowColorAndOpacity(FLinearColor(0.0f, 0.0f, 0.0f, 0.8f));

    UVerticalBoxSlot* LabelSlot = Parent->AddChildToVerticalBox(Label);
    LabelSlot->SetPadding(FMargin(0.0f, 2.0f));

    return Label;
}

void UPlanetStatusWidget::CreateResourceRow(UVerticalBox* Parent, const FString& Label, const FLinearColor& IconColor, TObjectPtr<UTextBlock>& OutValueText)
{
    UHorizontalBox* Row = WidgetTree->ConstructWidget<UHorizontalBox>(UHorizontalBox::StaticClass());

    UImage* Icon = WidgetTree->ConstructWidget<UImage>(UImage::StaticClass());
    Icon->SetColorAndOpacity(IconColor);
    Icon->SetDesiredSizeOverride(FVector2D(12.0f, 12.0f));
    UHorizontalBoxSlot* IconSlot = Row->AddChildToHorizontalBox(Icon);
    IconSlot->SetPadding(FMargin(0.0f, 3.0f, 6.0f, 0.0f));
    IconSlot->SetVerticalAlignment(EVerticalAlignment::VAlign_Center);

    UTextBlock* NameLabel = WidgetTree->ConstructWidget<UTextBlock>(UTextBlock::StaticClass());
    NameLabel->SetText(FText::FromString(Label + TEXT(":")));
    NameLabel->SetColorAndOpacity(FSlateColor(FLinearColor(0.85f, 0.85f, 0.9f)));
    NameLabel->SetFont(FCoreStyle::GetDefaultFontStyle("Regular", 13));
    NameLabel->SetShadowOffset(FVector2D(1.0f, 1.0f));
    NameLabel->SetShadowColorAndOpacity(FLinearColor(0.0f, 0.0f, 0.0f, 0.8f));
    UHorizontalBoxSlot* NameSlot = Row->AddChildToHorizontalBox(NameLabel);
    NameSlot->SetPadding(FMargin(0.0f, 0.0f, 6.0f, 0.0f));

    OutValueText = WidgetTree->ConstructWidget<UTextBlock>(UTextBlock::StaticClass());
    OutValueText->SetText(FText::FromString(TEXT("0")));
    OutValueText->SetColorAndOpacity(FSlateColor(FLinearColor::White));
    OutValueText->SetFont(FCoreStyle::GetDefaultFontStyle("Bold", 13));
    OutValueText->SetShadowOffset(FVector2D(1.0f, 1.0f));
    OutValueText->SetShadowColorAndOpacity(FLinearColor(0.0f, 0.0f, 0.0f, 0.8f));
    Row->AddChildToHorizontalBox(OutValueText);

    UVerticalBoxSlot* RowSlot = Parent->AddChildToVerticalBox(Row);
    RowSlot->SetPadding(FMargin(0.0f, 2.0f));
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
        const FString ProductionSummary = FString::Printf(TEXT("Produccion: M+%d C+%d D+%d E+%d /h"),
            NewData.Production.Metal,
            NewData.Production.Crystal,
            NewData.Production.Deuterium,
            NewData.Production.Energy);
        ProductionText->SetText(FText::FromString(ProductionSummary));
    }

    if (FleetText)
    {
        FleetText->SetText(FText::FromString(FString::Printf(TEXT("Naves: %d"), NewData.TotalShips)));
    }

    if (PhaseText)
    {
        PhaseText->SetText(FText::FromString(FString::Printf(TEXT("Fase: %s"), *NewData.Phase)));
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
