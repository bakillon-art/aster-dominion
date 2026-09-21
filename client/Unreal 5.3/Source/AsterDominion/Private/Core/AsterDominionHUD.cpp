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

    const float X = 24.0f;
    const float Y = 24.0f;
    const float PanelWidth = 330.0f;
    const float PanelHeight = 300.0f;
    const float Padding = 14.0f;
    const float LineHeight = 26.0f;

    // Panel background
    Canvas->K2_DrawBox(FVector2D(X, Y), FVector2D(PanelWidth, PanelHeight), 0.0f, FLinearColor(0.01f, 0.02f, 0.045f, 0.92f));

    // Panel border (top accent line)
    Canvas->K2_DrawBox(FVector2D(X, Y), FVector2D(PanelWidth, 2.0f), 0.0f, FLinearColor(0.28f, 0.78f, 1.0f, 1.0f));
    // Subtle outer border
    Canvas->K2_DrawBox(FVector2D(X, Y + PanelHeight - 1.0f), FVector2D(PanelWidth, 1.0f), 0.0f, FLinearColor(0.2f, 0.25f, 0.35f, 0.6f));

    UFont* Font = GEngine->GetMediumFont();
    float TextY = Y + Padding;

    auto DrawText = [&](const FString& Text, const FColor& Color, float Scale = 1.0f)
    {
        FCanvasTextItem TextItem(FVector2D(X + Padding, TextY), FText::FromString(Text), Font, Color);
        TextItem.EnableShadow(FLinearColor::Black);
        TextItem.Scale = FVector2D(Scale, Scale);
        Canvas->DrawItem(TextItem);
        TextY += LineHeight * Scale;
    };

    auto DrawRow = [&](const FString& Label, const FString& Value, const FLinearColor& IconColor)
    {
        Canvas->K2_DrawBox(FVector2D(X + Padding, TextY + 6.0f), FVector2D(12.0f, 12.0f), 0.0f, IconColor);
        FCanvasTextItem TextItem(FVector2D(X + Padding + 20.0f, TextY), FText::FromString(Label + TEXT(": ") + Value), Font, FColor(235, 235, 240, 255));
        TextItem.EnableShadow(FLinearColor::Black);
        Canvas->DrawItem(TextItem);
        TextY += LineHeight;
    };

    DrawText(TEXT("ASTER DOMINION"), FColor(80, 215, 255, 255), 1.3f);
    TextY += 4.0f;

    if (!bHasDashboardData)
    {
        DrawText(TEXT("Cargando datos del imperio..."), FColor(200, 200, 200, 255));
        return;
    }

    DrawText(CurrentDashboard.PlanetName, FColor(150, 220, 255, 255), 1.1f);
    DrawText(CurrentDashboard.PlayerName, FColor(190, 190, 195, 255), 0.85f);
    TextY += 6.0f;

    DrawRow(TEXT("Metal"), FString::FromInt(CurrentDashboard.Resources.Metal), FLinearColor(0.75f, 0.75f, 0.78f, 1.0f));
    DrawRow(TEXT("Cristal"), FString::FromInt(CurrentDashboard.Resources.Crystal), FLinearColor(0.4f, 0.8f, 1.0f, 1.0f));
    DrawRow(TEXT("Deuterio"), FString::FromInt(CurrentDashboard.Resources.Deuterium), FLinearColor(0.4f, 1.0f, 0.59f, 1.0f));
    DrawRow(TEXT("Energia"), FString::FromInt(CurrentDashboard.Resources.Energy), FLinearColor(1.0f, 0.84f, 0.31f, 1.0f));

    TextY += 6.0f;
    DrawText(FString::Printf(TEXT("Produccion: M+%d C+%d D+%d E+%d /h"),
        CurrentDashboard.Production.Metal,
        CurrentDashboard.Production.Crystal,
        CurrentDashboard.Production.Deuterium,
        CurrentDashboard.Production.Energy), FColor(180, 180, 190, 255), 0.85f);
    DrawText(FString::Printf(TEXT("Naves: %d"), CurrentDashboard.TotalShips), FColor(230, 180, 100, 255), 0.9f);
    DrawText(FString::Printf(TEXT("Fase: %s"), *CurrentDashboard.Phase), FColor(130, 150, 175, 255), 0.8f);

    // --- Action buttons panel (right side) ---
    if (!bButtonsBuilt)
    {
        BuildActionButtons();
    }

    FVector2D MousePos = FVector2D::ZeroVector;
    APlayerController* PC = GetOwningPlayerController();
    if (PC)
    {
        float MX = 0.0f, MY = 0.0f;
        PC->GetMousePosition(MX, MY);
        MousePos = FVector2D(MX, MY);
    }

    for (const FHudButton& Button : ActionButtons)
    {
        const bool bHovered =
            MousePos.X >= Button.Position.X && MousePos.X <= Button.Position.X + Button.Size.X &&
            MousePos.Y >= Button.Position.Y && MousePos.Y <= Button.Position.Y + Button.Size.Y;
        DrawButton(Button, MousePos, bHovered);
    }

    // Click handling
    if (PC && PC->WasInputKeyJustPressed(EKeys::LeftMouseButton))
    {
        HandleClick(MousePos);
    }
}

void AAsterDominionHUD::BuildActionButtons()
{
    ActionButtons.Empty();

    const float BX = 24.0f;
    const float BY = 340.0f;
    const float BW = 330.0f;
    const float BH = 30.0f;
    const float Gap = 6.0f;

    const FLinearColor BuildColor(0.16f, 0.4f, 0.7f, 0.95f);
    const FLinearColor FleetColor(0.5f, 0.35f, 0.12f, 0.95f);

    auto AddButton = [&](const FString& Label, const FString& Endpoint, const FString& Param, const FLinearColor& Color, int32 Row)
    {
        FHudButton B;
        B.Label = Label;
        B.Action = Endpoint;
        B.Param = Param;
        B.Position = FVector2D(BX, BY + Row * (BH + Gap));
        B.Size = FVector2D(BW, BH);
        B.Color = Color;
        ActionButtons.Add(B);
    };

    AddButton(TEXT("Construir: Extractor mineral"), TEXT("build"), TEXT("mineral_extractor"), BuildColor, 0);
    AddButton(TEXT("Construir: Refineria de cristal"), TEXT("build"), TEXT("crystal_refinery"), BuildColor, 1);
    AddButton(TEXT("Construir: Planta de deuterio"), TEXT("build"), TEXT("deuterium_plant"), BuildColor, 2);
    AddButton(TEXT("Construir: Planta solar"), TEXT("build"), TEXT("solar_plant"), BuildColor, 3);
    AddButton(TEXT("Crear flota: 2x Carguero ligero"), TEXT("fleet"), TEXT("light_cargo"), FleetColor, 4);
    AddButton(TEXT("Crear flota: 2x Interceptor"), TEXT("fleet"), TEXT("interceptor"), FleetColor, 5);

    bButtonsBuilt = true;
}

void AAsterDominionHUD::DrawButton(const FHudButton& Button, const FVector2D& MousePos, bool bHovered)
{
    FLinearColor Fill = Button.Color;
    if (bHovered)
    {
        Fill = FLinearColor(
            FMath::Min(1.0f, Fill.R + 0.15f),
            FMath::Min(1.0f, Fill.G + 0.15f),
            FMath::Min(1.0f, Fill.B + 0.15f),
            Fill.A);
    }

    Canvas->K2_DrawBox(Button.Position, Button.Size, 0.0f, Fill);
    Canvas->K2_DrawBox(Button.Position, FVector2D(Button.Size.X, 1.5f), 0.0f, FLinearColor(1.0f, 1.0f, 1.0f, 0.25f));

    UFont* Font = GEngine->GetMediumFont();
    FCanvasTextItem TextItem(Button.Position + FVector2D(10.0f, 6.0f), FText::FromString(Button.Label), Font, FColor::White);
    TextItem.EnableShadow(FLinearColor::Black);
    TextItem.Scale = FVector2D(0.8f, 0.8f);
    Canvas->DrawItem(TextItem);
}

void AAsterDominionHUD::HandleClick(const FVector2D& MousePos)
{
    for (const FHudButton& Button : ActionButtons)
    {
        const bool bInside =
            MousePos.X >= Button.Position.X && MousePos.X <= Button.Position.X + Button.Size.X &&
            MousePos.Y >= Button.Position.Y && MousePos.Y <= Button.Position.Y + Button.Size.Y;

        if (bInside)
        {
            const FString Body = Button.Action == TEXT("build")
                ? FString::Printf(TEXT("{\"playerId\":\"player-demo\",\"buildingType\":\"%s\"}"), *Button.Param)
                : FString::Printf(TEXT("{\"playerId\":\"player-demo\",\"shipType\":\"%s\",\"quantity\":2}"), *Button.Param);

            SendAction(Button.Action, Body);
            return;
        }
    }
}

void AAsterDominionHUD::SendAction(const FString& Endpoint, const FString& JsonBody)
{
    const FString Url = FString::Printf(TEXT("http://localhost:3001/demo/%s"), *Endpoint);

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetVerb(TEXT("POST"));
    Request->SetURL(Url);
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    Request->SetContentAsString(JsonBody);
    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr, FHttpResponsePtr Response, bool bWasSuccessful)
        {
            if (bWasSuccessful && Response.IsValid() && (Response->GetResponseCode() == 200 || Response->GetResponseCode() == 201))
            {
                RefreshDashboard();
            }
            else
            {
                UE_LOG(LogTemp, Warning, TEXT("AsterDominionHUD: action failed (%d)"),
                    Response.IsValid() ? Response->GetResponseCode() : 0);
            }
        });
    Request->ProcessRequest();
}

void AAsterDominionHUD::RefreshDashboard()
{
    const FString Url = TEXT("http://localhost:3001/demo/dashboard/player-demo");
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetVerb(TEXT("GET"));
    Request->SetURL(Url);
    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr, FHttpResponsePtr Response, bool bWasSuccessful)
        {
            if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
            {
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

            if (PlayerPtr) { Data.PlayerId = (*PlayerPtr)->GetStringField(TEXT("id")); Data.PlayerName = (*PlayerPtr)->GetStringField(TEXT("username")); }
            if (PlanetPtr) { Data.PlanetName = (*PlanetPtr)->GetStringField(TEXT("name")); }
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
            if (FleetPtr) { Data.TotalShips = (*FleetPtr)->GetIntegerField(TEXT("totalShips")); }
            if (StatusPtr)
            {
                Data.Phase = (*StatusPtr)->GetStringField(TEXT("phase"));
                Data.bIsOnline = (*StatusPtr)->GetBoolField(TEXT("online"));
            }

            ApplyDashboard(Data);
        });
    Request->ProcessRequest();
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
