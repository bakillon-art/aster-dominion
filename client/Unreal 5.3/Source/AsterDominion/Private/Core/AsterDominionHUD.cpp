#include "Core/AsterDominionHUD.h"

#include "CanvasItem.h"
#include "CanvasTypes.h"
#include "Core/AsterDominionGameInstance.h"
#include "Core/AsterDominionPlayerState.h"
#include "Engine/Canvas.h"
#include "Engine/Engine.h"
#include "Engine/Font.h"
#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "Json.h"
#include "JsonUtilities.h"
#include "Blueprint/WidgetBlueprintLibrary.h"

AAsterDominionHUD::AAsterDominionHUD()
{
    StatusWidgetClass = UPlanetStatusWidget::StaticClass();
}

void AAsterDominionHUD::BeginPlay()
{
    Super::BeginPlay();
    UE_LOG(LogTemp, Log, TEXT("AsterDominionHUD BeginPlay"));

    if (StatusWidgetClass)
    {
        StatusWidget = CreateWidget<UPlanetStatusWidget>(GetOwningPlayerController(), StatusWidgetClass);
        if (StatusWidget)
        {
            StatusWidget->AddToViewport();
        }
    }

    bool bRequested = false;
    if (UWorld* World = GetWorld())
    {
        if (UASTERDOMINIONGAMEINSTANCE* GameInstance = Cast<UASTERDOMINIONGAMEINSTANCE>(World->GetGameInstance()))
        {
            UE_LOG(LogTemp, Log, TEXT("AsterDominionHUD: GameInstance found, loading dashboard"));
            if (GameInstance->ApiClient)
            {
                GameInstance->ApiClient->OnDashboardFetched.AddDynamic(this, &AAsterDominionHUD::ApplyDashboard);
            }
            GameInstance->LoadPlayerDashboard(TEXT("player-demo"));
            bRequested = true;
        }
    }

    if (!bRequested)
    {
        UE_LOG(LogTemp, Warning, TEXT("AsterDominionHUD: GameInstance not found, fetching dashboard directly"));
        const FString Url = TEXT("http://localhost:3001/demo/dashboard/player-demo");
        TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
        Request->SetVerb(TEXT("GET"));
        Request->SetURL(Url);
        Request->OnProcessRequestComplete().BindLambda(
            [this](FHttpRequestPtr, FHttpResponsePtr Response, bool bWasSuccessful)
            {
                if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
                {
                    UE_LOG(LogTemp, Warning, TEXT("AsterDominionHUD: dashboard request failed"));
                    return;
                }

                TSharedPtr<FJsonObject> JsonObject;
                TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Response->GetContentAsString());
                if (!FJsonSerializer::Deserialize(Reader, JsonObject) || !JsonObject.IsValid())
                {
                    return;
                }

                FPlanetHudData Data;
                const TSharedPtr<FJsonObject>* PlayerPtr = nullptr;
                const TSharedPtr<FJsonObject>* PlanetPtr = nullptr;
                const TSharedPtr<FJsonObject>* ResourcesPtr = nullptr;
                const TSharedPtr<FJsonObject>* ProductionPtr = nullptr;
                const TSharedPtr<FJsonObject>* FleetPtr = nullptr;
                const TSharedPtr<FJsonObject>* StatusPtr = nullptr;

                JsonObject->TryGetObjectField(TEXT("player"), PlayerPtr);
                JsonObject->TryGetObjectField(TEXT("planet"), PlanetPtr);
                JsonObject->TryGetObjectField(TEXT("resources"), ResourcesPtr);
                JsonObject->TryGetObjectField(TEXT("production"), ProductionPtr);
                JsonObject->TryGetObjectField(TEXT("fleetSummary"), FleetPtr);
                JsonObject->TryGetObjectField(TEXT("status"), StatusPtr);

                if (PlayerPtr)
                {
                    Data.PlayerId = (*PlayerPtr)->GetStringField(TEXT("id"));
                    Data.PlayerName = (*PlayerPtr)->GetStringField(TEXT("username"));
                }
                if (PlanetPtr)
                {
                    Data.PlanetName = (*PlanetPtr)->GetStringField(TEXT("name"));
                }
                if (ResourcesPtr)
                {
                    Data.Resources.Metal = (*ResourcesPtr)->GetIntegerField(TEXT("metal"));
                    Data.Resources.Crystal = (*ResourcesPtr)->GetIntegerField(TEXT("crystal"));
                    Data.Resources.Deuterium = (*ResourcesPtr)->GetIntegerField(TEXT("deuterium"));
                    Data.Resources.Energy = (*ResourcesPtr)->GetIntegerField(TEXT("energy"));
                }
                if (ProductionPtr)
                {
                    Data.Production.Metal = (*ProductionPtr)->GetIntegerField(TEXT("metal"));
                    Data.Production.Crystal = (*ProductionPtr)->GetIntegerField(TEXT("crystal"));
                    Data.Production.Deuterium = (*ProductionPtr)->GetIntegerField(TEXT("deuterium"));
                    Data.Production.Energy = (*ProductionPtr)->GetIntegerField(TEXT("energy"));
                }
                if (FleetPtr)
                {
                    Data.TotalShips = (*FleetPtr)->GetIntegerField(TEXT("totalShips"));
                }
                if (StatusPtr)
                {
                    Data.Phase = (*StatusPtr)->GetStringField(TEXT("phase"));
                    Data.bIsOnline = (*StatusPtr)->GetBoolField(TEXT("online"));
                }

                ApplyDashboard(Data);
            });
        Request->ProcessRequest();
    }
}

void AAsterDominionHUD::DrawHUD()
{
    Super::DrawHUD();

    if (!Canvas)
    {
        return;
    }

    const float X = 40.0f;
    float Y = 40.0f;
    const float LineHeight = 34.0f;
    const FLinearColor TextColor(0.9f, 0.95f, 1.0f, 1.0f);
    const FLinearColor TitleColor(0.4f, 0.8f, 1.0f, 1.0f);

    auto DrawLine = [&](const FString& Text, const FLinearColor& Color)
    {
        Canvas->SetDrawColor(Color.ToFColor(true));
        FCanvasTextItem TextItem(FVector2D(X, Y), FText::FromString(Text), GEngine->GetMediumFont(), FLinearColor::Black);
        TextItem.EnableShadow(FLinearColor::Black);
        Canvas->DrawItem(TextItem);
        Y += LineHeight;
    };

    DrawLine(TEXT("ASTER DOMINION"), TitleColor);

    if (!bHasDashboardData)
    {
        DrawLine(TEXT("Cargando datos del imperio..."), TextColor);
        return;
    }

    DrawLine(FString::Printf(TEXT("Planeta: %s"), *CurrentDashboard.PlanetName), TitleColor);
    DrawLine(FString::Printf(TEXT("Comandante: %s"), *CurrentDashboard.PlayerName), TextColor);
    DrawLine(FString::Printf(TEXT("Metal: %d"), CurrentDashboard.Resources.Metal), TextColor);
    DrawLine(FString::Printf(TEXT("Cristal: %d"), CurrentDashboard.Resources.Crystal), TextColor);
    DrawLine(FString::Printf(TEXT("Deuterio: %d"), CurrentDashboard.Resources.Deuterium), TextColor);
    DrawLine(FString::Printf(TEXT("Energia: %d"), CurrentDashboard.Resources.Energy), TextColor);
    DrawLine(FString::Printf(TEXT("Produccion: M+%d C+%d D+%d E+%d /h"),
        CurrentDashboard.Production.Metal,
        CurrentDashboard.Production.Crystal,
        CurrentDashboard.Production.Deuterium,
        CurrentDashboard.Production.Energy), TextColor);
    DrawLine(FString::Printf(TEXT("Naves: %d"), CurrentDashboard.TotalShips), TextColor);
    DrawLine(FString::Printf(TEXT("Fase: %s"), *CurrentDashboard.Phase), TextColor);
}

void AAsterDominionHUD::ApplyDashboard(const FPlanetHudData& Data)
{
    CurrentDashboard = Data;
    bHasDashboardData = true;

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
