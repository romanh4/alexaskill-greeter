#!/bin/bash
#https://florianmuller.com/automatic-backups-for-raspberry-pis-to-a-synology-nfs-share
# Automate Raspberry Pi Backups
#
#
# Usage: system_backup.sh {path} {days of retention}
#
# Below you can set the default values if no command line args are sent.
# The script will name the backup files {$HOSTNAME}.{YYYYmmdd}.img
# When the script deletes backups older then the specified retention
# it will only delete files with its own $HOSTNAME.
#
# Declare vars and set standard values
backup_path=/mnt/backup
retention_days=50
backup_date=$(date +'%m/%d/%Y')
printf "${backup_dir}" " Note: script execution was started" >> automationLog.txt

# Check that we are root!
if [[ ! $(whoami) =~ "root" ]]; then
printf "${backup_dir}" " Error: not running as root!" >> automationLog.txt
#echo "**********************************"
#echo "*** This needs to run as root! ***"
exit
fi

# Check to see if we got command line args
if [ ! -z $1 ]; then
   backup_path=$1
fi

if [ ! -z $2 ]; then
   retention_days=$2
fi

# Create trigger to force file system consistency check if image is restored
touch /boot/forcefsck

# Perform backup
dd if=/dev/mmcblk0 of=$backup_path/$HOSTNAME.$(date +%Y%m%d).img bs=1M
printf "${backup_dir}" " Note: backup was created" >> automationLog.txt
#test#2
dd if=/dev/mmcblk0 of=$backup_path/$HOSTNAME.$(date +%Y%m%d).img bs=1M

# Remove fsck trigger
rm /boot/forcefsck

# Delete old backups
find $backup_path/$HOSTNAME.*.img -mtime +$retention_days -type f -delete 
printf "${backup_dir}" " Note: script execution is done" >> automationLog.txt