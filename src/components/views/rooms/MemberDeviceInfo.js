/*
Copyright 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import MatrixClientPeg from '../../../MatrixClientPeg';
import sdk from '../../../index';
import Modal from '../../../Modal';

export default class MemberDeviceInfo extends React.Component {
    constructor(props) {
        super(props);
        this.onVerifyClick = this.onVerifyClick.bind(this);
        this.onUnverifyClick = this.onUnverifyClick.bind(this);
        this.onBlockClick = this.onBlockClick.bind(this);
        this.onUnblockClick = this.onUnblockClick.bind(this);
    }

    onVerifyClick() {
        var QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
        Modal.createDialog(QuestionDialog, {
            title: "Verify device",
            description: (
                <div>
                    <p>
                        To verify that this device can be trusted, please contact its
                        owner using some other means (e.g. in person or a phone call)
                        and ask them whether the key they see in their User Settings
                        for this device matches the key below:
                    </p>
                    <div className="mx_UserSettings_cryptoSection">
                        <ul>
                            <li><label>Device name:</label> <span>{ this.props.device.getDisplayName() }</span></li>
                            <li><label>Device ID:</label>   <span><code>{ this.props.device.deviceId}</code></span></li>
                            <li><label>Device key:</label>  <span><code><b>{ this.props.device.getFingerprint() }</b></code></span></li>
                        </ul>
                    </div>
                    <p>
                        If it matches, press the verify button below.
                        If it doesn't, then someone else is intercepting this device
                        and you probably want to press the block button instead.
                    </p>
                    <p>
                        In future this verification process will be more sophisticated.
                    </p>
                </div>
            ),
            button: "I verify that the keys match",
            onFinished: confirm=>{
                if (confirm) {
                    MatrixClientPeg.get().setDeviceVerified(
                        this.props.userId, this.props.device.deviceId, true
                    );
                }
            },
        });
    }

    onUnverifyClick() {
        MatrixClientPeg.get().setDeviceVerified(
            this.props.userId, this.props.device.deviceId, false
        );
    }

    onBlockClick() {
        MatrixClientPeg.get().setDeviceBlocked(
            this.props.userId, this.props.device.deviceId, true
        );
    }

    onUnblockClick() {
        MatrixClientPeg.get().setDeviceBlocked(
            this.props.userId, this.props.device.deviceId, false
        );
    }

    render() {
        if (!this.props.device) {
            return <div className="mx_MemberDeviceInfo"/>;
        }

        var indicator = null, blockButton = null, verifyButton = null;
        if (this.props.device.isBlocked()) {
            blockButton = (
                <button className="mx_MemberDeviceInfo_textButton mx_MemberDeviceInfo_unblock"
                  onClick={this.onUnblockClick}>
                    Unblock
                </button>
            );
        } else {
            blockButton = (
                <button className="mx_MemberDeviceInfo_textButton mx_MemberDeviceInfo_block"
                  onClick={this.onBlockClick}>
                    Block
                </button>
            );
        }

        if (this.props.device.isVerified()) {
            verifyButton = (
                <button className="mx_MemberDeviceInfo_textButton mx_MemberDeviceInfo_unverify"
                  onClick={this.onUnverifyClick}>
                    Unverify
                </button>
            );
        } else {
            verifyButton = (
                <button className="mx_MemberDeviceInfo_textButton mx_MemberDeviceInfo_verify"
                  onClick={this.onVerifyClick}>
                    Verify
                </button>
            );
        }

        if (!this.props.hideInfo) {
            if (this.props.device.isBlocked()) {
                indicator = (
                    <div className="mx_MemberDeviceInfo_blocked">
                        <img src="img/e2e-blocked.svg" width="12" height="12" style={{ marginLeft: "-1px" }} alt="Blocked"/>
                    </div>
                );
            } else if (this.props.device.isVerified()) {
                indicator = (
                    <div className="mx_MemberDeviceInfo_verified">
                        <img src="img/e2e-verified.svg" width="10" height="12" alt="Verified"/>
                    </div>
                );
            } else {
                indicator = (
                    <div className="mx_MemberDeviceInfo_unverified">
                        <img src="img/e2e-warning.svg" width="15" height="12" style={{ marginLeft: "-2px" }} alt="Unverified"/>
                    </div>
                );
            }

            var deviceName = this.props.device.ambiguous ?
                             (this.props.device.getDisplayName() ? this.props.device.getDisplayName() : "") + " (" + this.props.device.deviceId + ")" :
                             this.props.device.getDisplayName();

            var info = (
                <div className="mx_MemberDeviceInfo_deviceInfo">
                    <div className="mx_MemberDeviceInfo_deviceId">{deviceName}{indicator}</div>
                </div>
            );
        }

        return (
            <div className="mx_MemberDeviceInfo">
                { info }
                { verifyButton }
                { blockButton }
            </div>
        );
    }
};

MemberDeviceInfo.displayName = 'MemberDeviceInfo';
MemberDeviceInfo.propTypes = {
    userId: React.PropTypes.string.isRequired,
    device: React.PropTypes.object.isRequired,
    hideInfo: React.PropTypes.bool,
};
