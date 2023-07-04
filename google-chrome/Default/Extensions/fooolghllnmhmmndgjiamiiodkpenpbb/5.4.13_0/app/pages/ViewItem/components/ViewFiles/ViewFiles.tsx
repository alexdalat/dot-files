import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { ItemType } from '@common/constants/vault';
import { IItemFile } from '@common/interfaces/item';
import { convertBytesToSize } from '@common/utils/convertBytesToSize/convertBytesToSize';
import { FileSection } from '../FileSection/FileSection';
import styles from './ViewFiles.module.scss';

interface IViewFiles {
  files: Array<IItemFile>;
  itemId: string;
  itemType: ItemType;
}

export const ViewFiles = ({ files, itemId, itemType }: IViewFiles) => {
  if (!files.length) {
    return null;
  }

  return (
    <div className="justify-center mx-4 mb-9">
      <p className="color-primary font-bold mb-3"><FormattedMessage id="attachedFiles" /></p>
      <div className={cx(styles['files-section'], 'color-primary bg-primary-accent-8 rounded-2 flex flex-col justify-center')}>
        {files.map(({ metadata: { name, size_in_bytes: sizeInBytes, type }, file_uuid: fileId }) => (
          <FileSection
            key={fileId}
            name={name}
            fileId={fileId}
            itemId={itemId}
            itemType={itemType}
            size={convertBytesToSize(sizeInBytes)}
            fileType={type}
          />
        ))}
      </div>
    </div>
  );
};
