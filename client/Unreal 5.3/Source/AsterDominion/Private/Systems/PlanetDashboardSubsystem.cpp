#include "Systems/PlanetDashboardSubsystem.h"

#include "HttpModule.h"
#include "Interfaces/IHttpRequest.h"
#include "Interfaces/IHttpResponse.h"
#include "Json.h"
#include "JsonUtilities.h"

UPlanetDashboardSubsystem::UPlanetDashboardSubsystem()
{
    bIsLoaded = false;
}

void UPlanetDashboardSubsystem::LoadDashboard(const FString& PlayerId)
{
    const FString Url = FString::Printf(TEXT("%s/demo/dashboard/%s"), *BackendUrl, *PlayerId);

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetVerb(TEXT("GET"));
    Request->SetURL(Url);
    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
        {
            if (!bWasSuccessful || !Response.IsValid() || Response->GetResponseCode() != 200)
            {
                bIsLoaded = false;
                return;
            }

            ParsePayload(Response->GetContentAsString());
            bIsLoaded = true;
        });

    Request->ProcessRequest();
}

void UPlanetDashboardSubsystem::ParsePayload(const FString& JsonString)
{
    TSharedPtr<FJsonObject> JsonObject;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);

    if (!FJsonSerializer::Deserialize(Reader, JsonObject) || !JsonObject.IsValid())
    {
        bIsLoaded = false;
        return;
    }

    DashboardData = FPlanetHudData();

    const TSharedPtr<FJsonObject>* PlayerObjectPtr = nullptr;
    const TSharedPtr<FJsonObject>* ResourcesObjectPtr = nullptr;
    const TSharedPtr<FJsonObject>* ProductionObjectPtr = nullptr;
    const TSharedPtr<FJsonObject>* FleetSummaryObjectPtr = nullptr;
    const TSharedPtr<FJsonObject>* StatusObjectPtr = nullptr;
    const TSharedPtr<FJsonObject>* PlanetObjectPtr = nullptr;

    JsonObject->TryGetObjectField(TEXT("player"), PlayerObjectPtr);
    JsonObject->TryGetObjectField(TEXT("resources"), ResourcesObjectPtr);
    JsonObject->TryGetObjectField(TEXT("production"), ProductionObjectPtr);
    JsonObject->TryGetObjectField(TEXT("fleetSummary"), FleetSummaryObjectPtr);
    JsonObject->TryGetObjectField(TEXT("status"), StatusObjectPtr);
    JsonObject->TryGetObjectField(TEXT("planet"), PlanetObjectPtr);

    const TSharedPtr<FJsonObject> PlayerObject = PlayerObjectPtr ? *PlayerObjectPtr : nullptr;
    const TSharedPtr<FJsonObject> ResourcesObject = ResourcesObjectPtr ? *ResourcesObjectPtr : nullptr;
    const TSharedPtr<FJsonObject> ProductionObject = ProductionObjectPtr ? *ProductionObjectPtr : nullptr;
    const TSharedPtr<FJsonObject> FleetSummaryObject = FleetSummaryObjectPtr ? *FleetSummaryObjectPtr : nullptr;
    const TSharedPtr<FJsonObject> StatusObject = StatusObjectPtr ? *StatusObjectPtr : nullptr;
    const TSharedPtr<FJsonObject> PlanetObject = PlanetObjectPtr ? *PlanetObjectPtr : nullptr;

    if (PlayerObject.IsValid())
    {
        DashboardData.PlayerId = PlayerObject->GetStringField(TEXT("id"));
        DashboardData.PlayerName = PlayerObject->GetStringField(TEXT("username"));
    }

    if (PlanetObject.IsValid())
    {
        DashboardData.PlanetName = PlanetObject->GetStringField(TEXT("name"));
    }

    if (ResourcesObject.IsValid())
    {
        DashboardData.Resources.Metal = ResourcesObject->GetIntegerField(TEXT("metal"));
        DashboardData.Resources.Crystal = ResourcesObject->GetIntegerField(TEXT("crystal"));
        DashboardData.Resources.Deuterium = ResourcesObject->GetIntegerField(TEXT("deuterium"));
        DashboardData.Resources.Energy = ResourcesObject->GetIntegerField(TEXT("energy"));
    }

    if (ProductionObject.IsValid())
    {
        DashboardData.Production.Metal = ProductionObject->GetIntegerField(TEXT("metal"));
        DashboardData.Production.Crystal = ProductionObject->GetIntegerField(TEXT("crystal"));
        DashboardData.Production.Deuterium = ProductionObject->GetIntegerField(TEXT("deuterium"));
        DashboardData.Production.Energy = ProductionObject->GetIntegerField(TEXT("energy"));
    }

    if (FleetSummaryObject.IsValid())
    {
        DashboardData.TotalShips = FleetSummaryObject->GetIntegerField(TEXT("totalShips"));
    }

    if (StatusObject.IsValid())
    {
        DashboardData.Phase = StatusObject->GetStringField(TEXT("phase"));
        DashboardData.bIsOnline = StatusObject->GetBoolField(TEXT("online"));
    }
}
