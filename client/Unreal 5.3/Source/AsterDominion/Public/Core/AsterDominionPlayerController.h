#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "AsterDominionPlayerController.generated.h"

UCLASS()
class ASTERDOMINION_API AAsterDominionPlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    AAsterDominionPlayerController();

protected:
    virtual void BeginPlay() override;
};
