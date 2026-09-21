#include "Systems/GameApiClient.h"

#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "Json.h"
#include "JsonUtilities.h"

UGameApiClient::UGameApiClient()
{
    bReady = false;
}

void UGameApiClient::FetchDashboard(const FString& PlayerId)
{
    const FString Url = FString::Printf(TEXT("%s/demo/dashboard/%s"), *BackendBaseUrl, *PlayerId);

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetVerb(TEXT("GET"));
    Request->SetURL(Url);
    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
        {
            if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
            {
                bReady = false;
                return;
            }

            const FString JsonString = Response->GetContentAsString();
            ParseDashboardPayload(JsonString);
            bReady = true;
        });

    Request->ProcessRequest();
}

bool UGameApiClient::IsReady() const
{
    return bReady;
}

void UGameApiClient::ParseDashboardPayload(const FString& JsonString)
{
    TSharedPtr<FJsonObject> JsonObject;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);

    if (!FJsonSerializer::Deserialize(Reader, JsonObject) || !JsonObject.IsValid())
    {
        bReady = false;
        return;
    }

    const TSharedPtr<FJsonObject> PlayerObj = JsonObject->TryGetObjectField(TEXT("player"));
    const TSharedPtr<FJsonObject> PlanetObj = JsonObject->TryGetObjectField(TEXT("planet"));
    const TSharedPtr<FJsonObject> ResourcesObj = JsonObject->TryGetObjectField(TEXT("resources"));
    const TSharedPtr<FJsonObject> ProductionObj = JsonObject->TryGetObjectField(TEXT("production"));
    const TSharedPtr<FJsonObject> FleetSummaryObj = JsonObject->TryGetObjectField(TEXT("fleetSummary"));
    const TSharedPtr<FJsonObject> StatusObj = JsonObject->TryGetObjectField(TEXT("status"));

    LastDashboard = FPlanetHudData();

    if (PlayerObj.IsValid())
    {
        LastDashboard.PlayerId = PlayerObj->GetStringField(TEXT("id"));
        LastDashboard.PlayerName = PlayerObj->GetStringField(TEXT("username"));
    }

    if (PlanetObj.IsValid())
    {
        LastDashboard.PlanetName = PlanetObj->GetStringField(TEXT("name"));
    }

    if (ResourcesObj.IsValid())
    {
        LastDashboard.Resources.Metal = ResourcesObj->GetIntegerField(TEXT("metal"));
        LastDashboard.Resources.Crystal = ResourcesObj->GetIntegerField(TEXT("crystal"));
        LastDashboard.Resources.Deuterium = ResourcesObj->GetIntegerField(TEXT("deuterium"));
        LastDashboard.Resources.Energy = ResourcesObj->GetIntegerField(TEXT("energy"));
    }

    if (ProductionObj.IsValid())
    {
        LastDashboard.Production.Metal = ProductionObj->GetIntegerField(TEXT("metal"));
        LastDashboard.Production.Crystal = ProductionObj->GetIntegerField(TEXT("crystal"));
        LastDashboard.Production.Deuterium = ProductionObj->GetIntegerField(TEXT("deuterium"));
        LastDashboard.Production.Energy = ProductionObj->GetIntegerField(TEXT("energy"));
    }

    if (FleetSummaryObj.IsValid())
    {
        LastDashboard.TotalShips = FleetSummaryObj->GetIntegerField(TEXT("totalShips"));
    }

    if (StatusObj.IsValid())
    {
        LastDashboard.Phase = StatusObj->GetStringField(TEXT("phase"));
        LastDashboard.bIsOnline = StatusObj->GetBoolField(TEXT("online"));
    }

    OnDashboardFetched.Broadcast(LastDashboard);
}
