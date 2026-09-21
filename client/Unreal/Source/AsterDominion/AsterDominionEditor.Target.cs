using UnrealBuildTool;
using System.Collections.Generic;

public class AsterDominionEditorTarget : TargetRules
{
    public AsterDominionEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V2;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_3;
    }
}
