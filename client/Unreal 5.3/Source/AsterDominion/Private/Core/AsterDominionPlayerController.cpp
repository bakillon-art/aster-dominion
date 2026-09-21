#include "Core/AsterDominionPlayerController.h"

AAsterDominionPlayerController::AAsterDominionPlayerController()
{
    bShowMouseCursor = true;
}

void AAsterDominionPlayerController::BeginPlay()
{
    Super::BeginPlay();

    FInputModeGameAndUI InputMode;
    InputMode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);
    SetInputMode(InputMode);
}
