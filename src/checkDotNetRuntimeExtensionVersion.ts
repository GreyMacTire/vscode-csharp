/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { lt } from 'semver';

export const DotNetRuntimeExtensionId = 'ms-dotnettools.vscode-dotnet-runtime';
const requiredDotNetRuntimeExtensionVersion = '2.2.3';

export async function checkDotNetRuntimeExtensionVersion(context: vscode.ExtensionContext): Promise<void> {
    const dotnetRuntimeExtension = vscode.extensions.getExtension(DotNetRuntimeExtensionId);
    // The .NET Install Tool is not declared as a dependency in this fork, so it may not be installed at all.
    const dotnetRuntimeExtensionVersion = dotnetRuntimeExtension?.packageJSON.version ?? '0.0.0';
    if (lt(dotnetRuntimeExtensionVersion, requiredDotNetRuntimeExtensionVersion)) {
        const prompt = vscode.l10n.t(
            'The {0} extension requires at least {1} of the .NET Install Tool ({2}) extension. Please update to continue',
            context.extension.packageJSON.displayName,
            requiredDotNetRuntimeExtensionVersion,
            DotNetRuntimeExtensionId
        );
        // The tool is installed manually in this fork, so no button installs it from the Marketplace.
        await vscode.window.showErrorMessage(prompt);
        throw new Error(
            vscode.l10n.t(
                'Version {0} of the .NET Install Tool ({1}) was not found, {2} will not activate.',
                requiredDotNetRuntimeExtensionVersion,
                DotNetRuntimeExtensionId,
                context.extension.packageJSON.displayName
            )
        );
    }
}
