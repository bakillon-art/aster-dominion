#include "Core/AsterDominionPlayerState.h"

AAsterDominionPlayerState::AAsterDominionPlayerState()
{
}

void AAsterDominionPlayerState::SetDashboard(const FPlanetHudData& NewDashboard)
{
    Dashboard = NewDashboard;
}
