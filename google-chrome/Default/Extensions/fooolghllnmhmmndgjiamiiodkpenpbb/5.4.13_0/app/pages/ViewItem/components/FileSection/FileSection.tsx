import { SvgIcon } from '@common/components/SvgIcon';
import { ItemType } from '@common/constants/vault';
import { getFileTypeIcon } from '@common/utils/getFileTypeIcon';
import { FileSectionActions } from './FileSectionActions';

interface IFileSection {
  name: string;
  size: string | null;
  fileId: string;
  itemId: string;
  itemType: ItemType;
  fileType: string;
}

export const FileSection = ({ name, size, fileId, itemId, itemType, fileType }: IFileSection) => {
  const AttachmentIcon = getFileTypeIcon(fileType);
  return (
    <div className="file-section flex hover:bg-primary-accent-26 border-t border-primary duration-250 ease-out pl-4 py-3 pr-3 w-full">
      <SvgIcon
        src={AttachmentIcon}
        className="mr-4 self-center"
        width={32}
        height={32}
      />
      <div className="flex flex-1 flex-col truncate mr-4">
        <p className="truncate">{name}</p>
        <p className="color-primary-accent-17 text-micro">{size}</p>
      </div>
      <FileSectionActions
        fileId={fileId}
        fileName={name}
        itemId={itemId}
        itemType={itemType}
        fileType={fileType}
      />
    </div>
  );
};
