import unreal

icons = ["metal", "crystal", "deuterium", "energy"]
src_dir = "C:/Users/Isaac/Desktop/aster-dominion/client/Unreal 5.3/Content/UI/Icons"
dest = "/Game/UI/Icons"

for name in icons:
    task = unreal.AssetImportTask()
    task.filename = src_dir + "/" + name + ".png"
    task.destination_path = dest
    task.destination_name = name
    task.replace_existing = True
    task.automated = True
    task.save = True
    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    unreal.log("imported " + name)