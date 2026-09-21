#include "Core/AsterDominionGameInstance.h"

void UASTERDOMINIONGAMEINSTANCE::Init()
{
    Super::Init();
    ApiClient = NewObject<UGameApiClient>(this, TEXT("GameApiClient"));
}

void UASTERDOMINIONGAMEINSTANCE::LoadPlayerDashboard(const FString& PlayerId)
{
    if (!ApiClient)
    {
        ApiClient = NewObject<UGameApiClient>(this, TEXT("GameApiClient"));
    }

    ApiClient->FetchDashboard(PlayerId);
}
