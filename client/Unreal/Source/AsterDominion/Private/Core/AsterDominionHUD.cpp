#include "Core/AsterDominionHUD.h"

#include "Core/AsterDominionGameInstance.h"
#include "Blueprint/WidgetBlueprintLibrary.h"

AAsterDominionHUD::AAsterDominionHUD()
{
    StatusWidgetClass = UPlanetStatusWidget::StaticClass();
}

void AAsterDominionHUD::BeginPlay()
{
    Super::BeginPlay();

    if (StatusWidgetClass)
    {
        StatusWidget = CreateWidget<UPlanetStatusWidget>(GetOwningPlayerController(), StatusWidgetClass);
        if (StatusWidget)
        {
            StatusWidget->AddToViewport();
        }
    }

    if (UWorld* World = GetWorld())
    {
        if (UASTERDOMINIONGAMEINSTANCE* GameInstance = Cast<UASTERDOMINIONGAMEINSTANCE>(World->GetGameInstance()))
        {
            if (GameInstance->ApiClient)
            {
                GameInstance->ApiClient->OnDashboardFetched.AddDynamic(this, &AAsterDominionHUD::ApplyDashboard);
            }

            GameInstance->LoadPlayerDashboard(TEXT("player-demo"));
        }
    }
}

void AAsterDominionHUD::ApplyDashboard(const FPlanetHudData& Data)
{
    CurrentDashboard = Data;

    if (APlayerController* PC = GetOwningPlayerController())
    {
        if (AAsterDominionPlayerState* PlayerState = PC->GetPlayerState<AAsterDominionPlayerState>())
        {
            PlayerState->SetDashboard(Data);
        }
    }

    if (StatusWidget)
    {
        StatusWidget->SetData(Data);
    }
}
