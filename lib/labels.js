module.exports = function(remoteLabels, commandLabels) {
  return {
    command: getCommandLabel,
    remote: getRemoteLabel
  };

  function getCommandLabel(remote, command) {
    return commandLabels && commandLabels[remote] && commandLabels[remote][command] ? commandLabels[remote][command] : command;
  }

  function getRemoteLabel(remote) {
    return remoteLabels && remoteLabels[remote] ? remoteLabels[remote] : remote;
  }
}
