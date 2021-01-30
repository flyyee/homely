import os
import time
import pathlib
import sys
import shutil

def relaunch(restart=False):
    print("Relaunch function called.")
    if restart:
        stop(verbose=False)
    os.system("cd")
    os.system("git add .")
    os.system("git commit -m \"launcher edit\"")
    os.system("git push heroku master")
    os.system("heroku ps:scale web=1")
    # os.system("heroku logs --tail")

def stop(verbose=True):
    if verbose:
        print("Stop function called.")
    os.system("heroku ps:scale web=0")

def restart(verbose=True):
    if verbose:
        print("Restart function called.")
    os.system("heroku restart")

if __name__ == "__main__":
    stop_first = False
    stop_only = False
    update_first = False
    check_interval = 10
    if len(sys.argv) > 1:
        if "-s" in sys.argv:
            stop_only = True
        if "-r" in sys.argv:
            stop_first = True
        if "-t" in sys.argv:
            check_interval = int(sys.argv[sys.argv.index("-t") + 1])
        if "-u" in sys.argv:
            update_first = True

    if stop_only:
        stop()
        exit()

    if stop_first:
        stop()

    root_directory = "./data"
    previous_file_list = []
    last_modified_time = 0

    continue_checking = True # TODO: add another thread that checks for commands
    check_count = 0
    relaunch_necessary = False
    first_check = True
    while continue_checking:
        check_count = (check_count + 1) % 10000
        # print(check_count)
        file_list = []
        new_last_modified_time = 0
        for path, subdirs, files in os.walk(root_directory):
            for name in files:
                file_path_original = os.path.join(path, name)
                file_path = file_path_original[len(root_directory) + 1::]
                file_list.append(file_path)
                # print(file_path)
                fname = pathlib.Path(file_path_original)
                # print(fname.stat().st_mtime)
                new_last_modified_time = max(new_last_modified_time, fname.stat().st_mtime)
        if previous_file_list != file_list:
            print("New file(s) added or removed")
            previous_file_list = file_list
            relaunch_necessary = True
        if new_last_modified_time > last_modified_time:
            last_modified_time = new_last_modified_time
            print("File(s) modified")
            previous_file_list = file_list
            relaunch_necessary = True

        if relaunch_necessary:
            shutil.make_archive("zips/all", 'zip', "data")
            relaunch_necessary = False
            if first_check:
                first_check = False
                if not update_first:
                    restart()
                    print("Server is up and running")
                    print("View logs with 'heroku logs --tail'")
                    continue
            print("Relaunching on iteration " + str(check_count))
            # print("relaunching")
            relaunch()
            print("Server is running with up-to-date data again")
            print("View logs with 'heroku logs --tail'")
        else:
            pass
            # print("no changes")
        
        time.sleep(check_interval)



# import subprocess
# process = subprocess.Popen(["heroku", "logs"], shell=True, stdout=subprocess.PIPE)
# # stdout = process.communicate()[0]
# while True:
#     output = process.stdout.readline()
#     if output.decode("utf8") == "" and process.poll() is not None:
#         break
#     elif output:
#         print(output.decode("utf8"))
# print("done")


# print(stdout.decode("utf8"))

# output = subprocess.check_output("cd", shell=True)
# print(output.decode("utf8"))

# os.system("cd")
# os.system("git add .")
# os.system("git commit -m \"launcher edit\"")
# os.system("git push heroku master")
# os.system("heroku ps:scale web=1")
# os.system("heroku logs --tail")
