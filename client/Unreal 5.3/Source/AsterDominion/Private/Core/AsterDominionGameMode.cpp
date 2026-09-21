#include "Core/AsterDominionGameMode.h"

#include "Core/AsterDominionHUD.h"
#include "Core/AsterDominionPlayerController.h"
#include "Core/PlanetActor.h"
#include "Core/PlanetCameraPawn.h"
#include "Core/StarFieldActor.h"
#include "Kismet/GameplayStatics.h"

AAsterDominionGameMode::AAsterDominionGameMode()
{
    PrimaryActorTick.bCanEverTick = false;
    PlanetActorClass = APlanetActor::StaticClass();
    DefaultPawnClass = APlanetCameraPawn::StaticClass();
    PlayerControllerClass = AAsterDominionPlayerController::StaticClass();
    HUDClass = AAsterDominionHUD::StaticClass();
}

void AAsterDominionGameMode::BeginPlay()
{
    Super::BeginPlay();

    // Spawn a star field around the scene.
    FActorSpawnParameters StarParams;
    StarParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    GetWorld()->SpawnActor<AStarFieldActor>(AStarFieldActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, StarParams);

    if (PlanetActorClass)
    {
        FActorSpawnParameters Params;
        Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

        APlanetActor* Planet = GetWorld()->SpawnActor<APlanetActor>(PlanetActorClass, FVector::ZeroVector, FRotator::ZeroRotator, Params);
        if (Planet)
        {
            Planet->SetActorLocation(FVector(0.0f, 0.0f, 0.0f));
            Planet->SetActorScale3D(FVector(1.4f, 1.4f, 1.4f));
        }
    }

    if (GetWorld() && GetWorld()->GetFirstPlayerController())
    {
        APlayerController* Controller = GetWorld()->GetFirstPlayerController();
        if (Controller)
        {
            Controller->SetInitialLocationAndRotation(FVector(0.0f, 0.0f, 0.0f), FRotator(0.0f, 0.0f, 0.0f));
        }
    }
}
