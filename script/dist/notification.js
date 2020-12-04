
let btnStartRecording = document.querySelector(".start-recording");

export  function notifyPic() {
  let notificationPermission = false;

  const btnAskPermission = document.querySelector(".askPermissionBtn");

  // allow notification
  btnAskPermission.addEventListener("click", async () => {
    console.log("permission");
    const answer = await Notification.requestPermission();
    if (answer == "granted") {
      notificationPermission = true;
      console.log("notification permission Granted");
    } else if (answer == "denied") {
      console.log("Notification : user denied notification");
    } else {
      // default
      console.log("Notification: user decline to answer");
    }
    // getSubsciption();
    //show notification for recording

    btnStartRecording.addEventListener("click", async () => {
      if (!notificationPermission) {
        console.log("we do not have permission to show notification");
        return;
      }

      const options = {
        body: "You are now recording!",
        icon: "./img/inst-512.png",
      };
      let notif = new Notification("Hello Michele", options);
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification("Reminder", options)
      );
      notif.addEventListener("show", () => {
        console.log("Show notification");
      });
      notif.addEventListener("click", () => {
        console.log("user clicked on notification");
      });
    });

    //show notification for pic
    let btnSnapshotNotify = document.querySelector(".snapshot");
    btnSnapshotNotify.addEventListener("click", async () => {
      if (!notificationPermission) {
        console.log("we do not have permission to show notification");
        return;
      }

      const options = {
        body: "This is your Snapshot",
        icon: "./img/inst-512.png",
      };
      let notif = new Notification("Hello Michele", options);
      navigator.serviceWorker.ready.then((reg) =>
        reg.showNotification("Reminder", options)
      );
      notif.addEventListener("show", () => {
        console.log("Show notification");
      });
      notif.addEventListener("click", () => {
        console.log("user clicked on notification");
      });
    });
  });
}
