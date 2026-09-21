using UnrealBuildTool;
using System.Collections.Generic;

public class AsterDominionTarget : TargetRules
{
    public AsterDominionTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V2;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_3;
    }
}
