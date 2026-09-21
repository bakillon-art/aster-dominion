#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "Systems/GameApiClient.h"
#include "AsterDominionGameInstance.generated.h"

UCLASS()
class UASTERDOMINIONGAMEINSTANCE : public UGameInstance
{
    GENERATED_BODY()

public:
    UPROPERTY(BlueprintReadOnly, VisibleAnywhere, Category = "AsterDominion")
    TObjectPtr<UGameApiClient> ApiClient;

    virtual void Init() override;

    UFUNCTION(BlueprintCallable, Category = "AsterDominion")
    void LoadPlayerDashboard(const FString& PlayerId);
};
