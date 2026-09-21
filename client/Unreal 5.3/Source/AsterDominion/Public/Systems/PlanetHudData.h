#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "PlanetHudData.generated.h"

USTRUCT(BlueprintType)
struct FResourceState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Metal = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Crystal = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Deuterium = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 Energy = 0;
};

USTRUCT(BlueprintType)
struct FPlanetHudData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString PlayerId;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString PlayerName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString PlanetName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FResourceState Resources;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FResourceState Production;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 TotalShips = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString Phase = TEXT("first-demo");

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    bool bIsOnline = true;
};
