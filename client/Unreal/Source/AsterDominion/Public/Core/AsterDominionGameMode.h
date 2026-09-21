#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "AsterDominionGameMode.generated.h"

UCLASS()
class ASTERDOMINION_API AAsterDominionGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    AAsterDominionGameMode();

protected:
    virtual void BeginPlay() override;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AsterDominion")
    TSubclassOf<class APlanetActor> PlanetActorClass;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AsterDominion")
    FString PlayerId = TEXT("player-demo");
};
