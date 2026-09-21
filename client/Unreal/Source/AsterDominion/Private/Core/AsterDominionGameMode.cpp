#include "Core/AsterDominionGameMode.h"

#include "Core/AsterDominionPlayerController.h"
#include "Core/PlanetActor.h"
#include "Core/PlanetCameraPawn.h"
#include "Kismet/GameplayStatics.h"

AAsterDominionGameMode::AAsterDominionGameMode()
{
    PrimaryActorTick.bCanEverTick = false;
    PlanetActorClass = APlanetActor::StaticClass();
    DefaultPawnClass = APlanetCameraPawn::StaticClass();
    PlayerControllerClass = AAsterDominionPlayerController::StaticClass();
}

void AAsterDominionGameMode::BeginPlay()
{
    Super::BeginPlay();

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
