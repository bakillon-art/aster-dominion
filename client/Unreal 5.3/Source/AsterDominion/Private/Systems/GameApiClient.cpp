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
    UE_LOG(LogTemp, Log, TEXT("GameApiClient: fetching %s"), *Url);

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

    const TSharedPtr<FJsonObject>* PlayerObjPtr = nullptr;
    const TSharedPtr<FJsonObject>* PlanetObjPtr = nullptr;
    const TSharedPtr<FJsonObject>* ResourcesObjPtr = nullptr;
    const TSharedPtr<FJsonObject>* ProductionObjPtr = nullptr;
    const TSharedPtr<FJsonObject>* FleetSummaryObjPtr = nullptr;
    const TSharedPtr<FJsonObject>* StatusObjPtr = nullptr;

    JsonObject->TryGetObjectField(TEXT("player"), PlayerObjPtr);
    JsonObject->TryGetObjectField(TEXT("planet"), PlanetObjPtr);
    JsonObject->TryGetObjectField(TEXT("resources"), ResourcesObjPtr);
    JsonObject->TryGetObjectField(TEXT("production"), ProductionObjPtr);
    JsonObject->TryGetObjectField(TEXT("fleetSummary"), FleetSummaryObjPtr);
    JsonObject->TryGetObjectField(TEXT("status"), StatusObjPtr);

    const TSharedPtr<FJsonObject> PlayerObj = PlayerObjPtr ? *PlayerObjPtr : nullptr;
    const TSharedPtr<FJsonObject> PlanetObj = PlanetObjPtr ? *PlanetObjPtr : nullptr;
    const TSharedPtr<FJsonObject> ResourcesObj = ResourcesObjPtr ? *ResourcesObjPtr : nullptr;
    const TSharedPtr<FJsonObject> ProductionObj = ProductionObjPtr ? *ProductionObjPtr : nullptr;
    const TSharedPtr<FJsonObject> FleetSummaryObj = FleetSummaryObjPtr ? *FleetSummaryObjPtr : nullptr;
    const TSharedPtr<FJsonObject> StatusObj = StatusObjPtr ? *StatusObjPtr : nullptr;

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
