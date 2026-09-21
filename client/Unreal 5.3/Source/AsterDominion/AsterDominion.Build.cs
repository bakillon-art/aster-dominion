using UnrealBuildTool;

public class AsterDominion : ModuleRules
{
    public AsterDominion(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "HTTP",
            "Json",
            "JsonUtilities",
            "UMG",
            "Slate",
            "SlateCore"
        });

        PrivateDependencyModuleNames.AddRange(new string[]
        {
        });

        // UE 5.3 headers are incompatible with MSVC 14.44+ strict parsing; relax warnings-as-errors.
        bWarningsAsErrors = true;
    }
}
