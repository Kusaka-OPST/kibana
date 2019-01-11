/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiButton,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { RepositoryUtils } from 'x-pack/plugins/code/common/repository_utils';
import { LanguageServer } from '../../../common/language_server';
import { RepositoryConfig } from '../../../model';
import { RepoConfigPayload, switchLanguageServer } from '../../actions';
import { RootState } from '../../reducers';
import { JavaIcon, TypeScriptIcon } from '../shared/icons';

const IconContainer = styled.div`
  display: inline-block;
  position: relative;
  top: 8px;
`;

const defaultConfig = {
  disableJava: true,
  disableTypescript: true,
};

interface StateProps {
  languageServers: LanguageServer[];
  config: RepositoryConfig;
}

interface DispatchProps {
  switchLanguageServer: (p: RepoConfigPayload) => void;
}

interface OwnProps {
  repoUri: string;
  url: string;
  onClose: () => void;
}

interface State {
  config: RepositoryConfig;
}

class ProjectSettingsModal extends React.PureComponent<
  StateProps & DispatchProps & OwnProps,
  State
> {
  public state = {
    config: this.props.config,
  };

  public onSwitchChange = (ls: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    this.setState((prevState: State) => ({
      config: { ...prevState.config, [`disable${ls}`]: !checked },
    }));
  };

  public saveChanges = () => {
    this.props.switchLanguageServer({
      repoUri: this.props.repoUri,
      config: this.state.config,
    });
  };

  public render() {
    const { repoUri, languageServers, onClose } = this.props;
    const { disableJava, disableTypescript } = this.state.config;
    const org = RepositoryUtils.orgNameFromUri(repoUri);
    const repoName = RepositoryUtils.repoNameFromUri(repoUri);
    const languageServerSwitches = languageServers.map(ls => {
      const checked = ls.name === 'Java' ? !disableJava : !disableTypescript;
      return (
        <div key={ls.name}>
          <EuiSwitch
            name={ls.name}
            label={
              <span>
                {ls.name === 'Java' ? (
                  <IconContainer>
                    <JavaIcon />
                  </IconContainer>
                ) : (
                  <IconContainer>
                    <TypeScriptIcon />
                  </IconContainer>
                )}
                {ls.name}
              </span>
            }
            checked={checked}
            onChange={this.onSwitchChange(ls.name)}
          />
        </div>
      );
    });
    return (
      <EuiOverlayMask>
        <EuiModal onClose={onClose}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h3>Project Settings</h3>
              <EuiText>
                {org}/{repoName}
              </EuiText>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiTitle size="xxs">
              <h5>Language Servers</h5>
            </EuiTitle>
            {languageServerSwitches}
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButton>Manage Language Servers</EuiButton>
            <EuiButton onClick={this.saveChanges}>Save Changes</EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: { repoUri: string }) => ({
  languageServers: state.languageServer.languageServers,
  config: state.repository.projectConfigs![ownProps.repoUri] || defaultConfig,
});

const mapDispatchToProps = {
  switchLanguageServer,
};

export const ProjectSettings = connect<StateProps, DispatchProps, OwnProps>(
  // @ts-ignore
  mapStateToProps,
  mapDispatchToProps
)(ProjectSettingsModal);
