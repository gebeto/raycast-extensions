import React from "react";
import { ActionPanel, Action, List } from "@raycast/api";
import fetch from "node-fetch";

type MetadataResponse = {
  metadata: {
    actions: {
      name: string;
      permissions: { role: string }[];
    }[];
    sources: {
      tables: {
        table: {
          name: string;
          schema: string;
        };
      }[];
    }[];
  };
};

type ServerDetails = {
  id: string;
  metadataUrl: string;
  consoleUrl: string;
  secret: string;
};

const servers: ServerDetails[] = [
  {
    id: "localhost:9695",
    metadataUrl: "http://localhost:8080/v1/metadata",
    consoleUrl: "http://localhost:9695/console",
    secret: "secretsecretsecret",
  },
];

const serverById = servers.reduce(
  (prev, curr) => ({
    ...prev,
    [curr.id]: curr,
  }),
  {}
);

const useMetadata = (server: ServerDetails) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [metadata, setMetadata] = React.useState<MetadataResponse>();

  React.useEffect(() => {
    setIsLoading(true);
    fetch(server.metadataUrl, {
      method: "POST",
      headers: {
        "x-hasura-admin-secret": server.secret,
      },
      body: JSON.stringify({
        args: {},
        type: "export_metadata",
        version: 2,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setIsLoading(false);
        setMetadata(res as MetadataResponse);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [server]);

  return { metadata, isLoading };
};

export default function Command() {
  const [serverId, setServerId] = React.useState<string>(servers[0].id);
  const server = serverById[serverId as keyof typeof serverById];
  const { metadata, isLoading } = useMetadata(server);

  console.log(metadata);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search metadata..."
      searchBarAccessory={
        <List.Dropdown tooltip="Server" value={servers[0].id} onChange={setServerId}>
          {servers.map((server) => (
            <List.Dropdown.Item key={server.id} title={server.id} value={server.id} />
          ))}
          <List.Dropdown.Section>
            <List.Dropdown.Item key="empty" title="Add server..." value="add" />
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      <List.Section title="Tables" subtitle="hasura tables">
        {metadata?.metadata?.sources.map((source) =>
          source.tables.map((table) => (
            <TableListItem key={`${table.table.schema}.${table.table.name}`} server={server} item={table.table} />
          ))
        )}
      </List.Section>
      <List.Section title="Actions" subtitle="hasura actions">
        {metadata?.metadata?.actions.map((action) => (
          <ActionListItem key={action.name} server={server} item={action} />
        ))}
      </List.Section>
    </List>
  );
}

function ActionListItem({
  server,
  item,
}: {
  server: ServerDetails;
  item: { name: string; permissions: { role: string }[] };
}) {
  return (
    <List.Item
      title={item.name}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              title="Open in Browser"
              url={`${server.consoleUrl}/console/actions/manage/${item.name}/modify`}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function TableListItem({ server, item }: { server: ServerDetails; item: { name: string; schema: string } }) {
  return (
    <List.Item
      title={item.name}
      subtitle={item.schema}
      accessoryTitle={item.schema}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              title="Open in Browser"
              url={`${server.consoleUrl}/data/default/schema/${item.schema}/tables/${item.name}/browse`}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
