# Contributing
Contributions are welcome, and they are greatly appreciated! 
Every little bit helps, and credit will always be given.

## Ways To Contribute
There are many different ways, in which you may contribute to this project, including:

   * Opening issues by using the [issue tracker](https://github.com/humio/humio2grafana/issues), using the correct issue template for your submission.
   * Commenting and expanding on open issues.
   * Propose fixes to open issues via a pull request.

We suggest that you create an issue on GitHub before starting to work on a pull request, as this gives us a better overview, and allows us to start a conversation about the issue.
We also encourage you to separate unrelated contributions into different pull requests. This makes it easier for us to understand your individual contributions and faster at reviewing them.

## Setting Up The Plugin For Local Development
1. Fork [humio2grafana](https://github.com/humio/humio2grafana)
   (look for the "Fork" button).
2. Clone your fork locally
    ```bash
    git clone git@github.com/{your-github-username}/python-humio.git
    ```
3. Install dependencies
    ```bash
    npm install
    ```
4. Build plugin into `dist` folder:
    ```bash
    npm run build 
    ```

5. Now copy the dist folder into the Grafana plugin directory The directory varies by OS as can be seen here:
    * Linux: /var/lib/grafana/data/plugins
    * MacOS: /usr/local/var/lib/grafana/data/plugins
    * Windows: C:\Program Files\GrafanaLabs\grafana\data\plugins

    If you have multiple plugins, rename the folder to `humio2grafana` to not cause a naming conflict.

    If you do not want to copy future builds symlink the local `dist` folder into the plugins directory. On Unix systems the symlink can be created in the following manner:
    ```bash
    ln -s $(pwd)/dist {grafana-plugins-directory}/humio2grafana
    ```
6. Restart Grafana to apply the plugin. It should not be accessible from Grafana, and you are now ready to implement your changes.

7. If you want, you can activate the `watch` feature to automatically build the plugin, when you change the source code.
    ```bash
    npm run watch
    ```
    Note that you still need to restart Grafana to apply your changes.

8. As your work progresses, regularly commit to and push your branch to your own fork on GitHub.
    ```bash
    git add .
    git commit -m "Your detailed description of your changes."
    git push origin name-of-your-bugfix-or-feature
    ```

### Sidenote: Running Humio Locally Alongside Grafana
Both Grafana and Humio use port 3000 as their default TCP port. This results in clashes when attempting to run them on the same system. To change Grafana's default port find the `grafana.ini` file, location depending on OS,and modify its `http_port` field. Then restart Grafana to apply the change.


## Running Tests locally
The tests are made to be run by the `karma` test runner. To run the local tests:
1. Install the karama CLI:
    ```bash
    npm install -g karma-cli
    ```
2. Run tests.
    
    Either a single time:
    ```bash
    karma start --single-run
    ```
    Or run tests continously at each change to the code:
    ```bash
    karma start
    ```

All test code can be found in the `specs` folder. API calls to Humio are mocked out, so tests run determinsitically and offline.

## Making A Pull Request
When you have made your changes locally, or you want feedback on a work in progress, you're almost ready to make a pull request.

Before you submit your pull request please go through the following check list.

1. Write new test cases if the old ones do not cover your new code.
2. Bump the version of the project according to [semantic versioning](https://semver.org/). 
    
    If you have made a bug fix:
    ```bash
    npm version patch
    ```

    If you have added a feature:
    ```bash
    npm version minor
    ```

    If you want to create a breaking change that requires a bump of the major version, please contact the maintainers so we can agree on a direction.
    
4. Add a note to ``CHANGELOG.md`` under the new version, which describes your contribution. Be thorough and add each of the following sections to your entry if applicable:
    * Added
    * Changed
    * Removed

5. Add yourself to ``AUTHORS.md``.

When you've been through the the checklist, push your final changes to your development branch on GitHub.
Afterwards, use the GitHub interface to create a pull request to the official repository.


Terms of Service For Contributors
=================================
For all contributions to this repository (software, bug fixes, configuration changes, documentation, or any other materials), we emphasize that this happens under GitHubs general Terms of Service and the license of this repository.

## Contributing as an individual
If you are contributing as an individual you must make sure to adhere to:

The [GitHub Terms of Service](https://help.github.com/en/github/site-policy/github-terms-of-service) __*Section D. User-Generated Content,*__ [Subsection: 6. Contributions Under Repository License](https://help.github.com/en/github/site-policy/github-terms-of-service#6-contributions-under-repository-license):

_"Whenever you make a contribution to a repository containing notice of a license, you license your contribution under the same terms, and you agree that you have the right to license your contribution under those terms. If you have a separate agreement to license your contributions under different terms, such as a contributor license agreement, that agreement will supersede.
Isn't this just how it works already? Yep. This is widely accepted as the norm in the open-source community; it's commonly referred to by the shorthand "inbound=outbound". We're just making it explicit."_

## Contributing on behalf of a Corporation
If you are contributing on behalf of a Corporation you must make sure to adhere to:

The [GitHub Corporate Terms of Service](https://help.github.com/en/github/site-policy/github-corporate-terms-of-service) _**Section D. Content Responsibility; Ownership; License Rights,**_ [subsection 5. Contributions Under Repository License](https://help.github.com/en/github/site-policy/github-corporate-terms-of-service#5-contributions-under-repository-license):

_Whenever Customer makes a contribution to a repository containing notice of a license, it licenses such contributions under the same terms and agrees that it has the right to license such contributions under those terms. If Customer has a separate agreement to license its contributions under different terms, such as a contributor license agreement, that agreement will supersede_