import {
  expose,
  Form,
  db,
  toast,
  ui,
  TemplateUiCommand,
} from "@kksh/api/ui/template";
import { WakeOnLanHost, WakeOnLanHostType } from "./models";

class AddWakeOnLan extends TemplateUiCommand {
  async onFormSubmit(value: Record<string, any>): Promise<void> {
    console.log(value);
    const { name, mac, ip, port } = value;
    // verify with regex
    if (!mac.match(/^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$/)) {
      toast.error("Invalid MAC address");
      return;
    }
    if (!ip.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)) {
      toast.error("Invalid IP address");
      return;
    }
    if (port < 1 || port > 65535) {
      toast.error("Invalid port");
      return;
    }
    db.add({
      data: JSON.stringify({
        mac,
        ip,
        port,
        name,
      } satisfies WakeOnLanHost),
      dataType: WakeOnLanHostType,
      searchText: name,
    })
      .then(() => {
        toast.success("Wake on lan host added", {
          description: "Now go to the other Wake On Lan Command to use it.",
        });
      })
      .catch((err) => {
        toast.error("Failed to add wake on lan host", {
          description: err.message,
        });
      });
  }

  async onBeforeGoBack(): Promise<void> {}

  async load() {
    return ui.render(
      new Form.Form({
        title: "Add Wake On Lan Host",
        description:
          "255.255.255.255 is the default broadcast ip. If you have multiple networks on your computer, use a more specific broadcast ip. For instance, if target host ip is 192.168.1.2, use 192.168.1.255",
        fields: [
          new Form.InputField({
            key: "name",
            label: "Name",
            placeholder: "Computer Name",
          }),
          new Form.InputField({
            key: "mac",
            label: "MAC Address",
            placeholder: "00:00:00:00:00:00",
          }),
          new Form.InputField({
            key: "ip",
            label: "Broadcast IP Address",
            placeholder: "255.255.255.255",
          }),
          new Form.NumberField({
            key: "port",
            label: "Broadcast Port",
            placeholder: "9",
            default: 9,
          }),
        ],
        key: "wake-on-lan",
      })
    );
  }
}

expose(new AddWakeOnLan());
