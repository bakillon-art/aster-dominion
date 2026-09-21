#include "Core/AsterDominionGameMode.h"

#include "Components/DirectionalLightComponent.h"
#include "Components/SkyLightComponent.h"
#include "Core/AsterDominionHUD.h"
#include "Core/AsterDominionPlayerController.h"
#include "Core/PlanetActor.h"
#include "Core/PlanetCameraPawn.h"
#include "Core/SolarSystemActor.h"
#include "Core/StarFieldActor.h"
#include "Engine/DirectionalLight.h"
#include "Engine/SkyLight.h"
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

    UWorld* World = GetWorld();
    if (!World)
    {
        return;
    }

    // Spawn a star field around the scene.
    FActorSpawnParameters StarParams;
    StarParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    World->SpawnActor<AStarFieldActor>(AStarFieldActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, StarParams);

    // Lighting: a key directional light plus a soft skylight so the empty map is visible.
    ADirectionalLight* Sun = World->SpawnActor<ADirectionalLight>(ADirectionalLight::StaticClass(), FVector(0.0f, 0.0f, 500.0f), FRotator(-50.0f, -30.0f, 0.0f), StarParams);
    if (Sun)
    {
        Sun->GetComponent()->SetIntensity(20.0f);
        Sun->GetComponent()->SetLightColor(FColor(255, 246, 232));
        Sun->SetMobility(EComponentMobility::Movable);
    }

    // Second light from the opposite side so nothing is pure black.
    ADirectionalLight* Fill = World->SpawnActor<ADirectionalLight>(ADirectionalLight::StaticClass(), FVector(0.0f, 0.0f, 500.0f), FRotator(30.0f, 150.0f, 0.0f), StarParams);
    if (Fill)
    {
        Fill->GetComponent()->SetIntensity(6.0f);
        Fill->GetComponent()->SetLightColor(FColor(150, 175, 220));
        Fill->SetMobility(EComponentMobility::Movable);
    }

    ASkyLight* Sky = World->SpawnActor<ASkyLight>(ASkyLight::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, StarParams);
    if (Sky)
    {
        Sky->GetLightComponent()->SetIntensity(2.5f);
        Sky->GetLightComponent()->SetLightColor(FColor(150, 175, 230));
        Sky->GetLightComponent()->SetMobility(EComponentMobility::Movable);
    }

    // Spawn the solar system: central sun with orbiting planets read from the backend galaxy.
    World->SpawnActor<ASolarSystemActor>(ASolarSystemActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, StarParams);

    APlayerController* Controller = World->GetFirstPlayerController();
    if (Controller)
    {
        Controller->SetInitialLocationAndRotation(FVector(0.0f, 0.0f, 0.0f), FRotator(0.0f, 0.0f, 0.0f));
    }
}
